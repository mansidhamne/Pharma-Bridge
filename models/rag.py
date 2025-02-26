import os
import nltk
from dotenv import load_dotenv
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import LLMChain
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec

nltk.download('punkt')
load_dotenv()

# Load API Keys
PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Pinecone Initialization
def initialize_pinecone(index_name="medicalbot"):
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    if not pc.has_index(index_name):
        print("Creating Index")
        pc.create_index(
            name=index_name,
            dimension=384,  # Must match embedding model output
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    else:
        print("Index already exists")
    
    return pc, index_name

# Load PDFs and Extract Data
def load_pdf_files(directory_path="data/"):
    loader = DirectoryLoader(directory_path, glob="*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    return documents

# Split Text into Chunks
def split_text(documents, chunk_size=500, chunk_overlap=20):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    text_chunks = text_splitter.split_documents(documents)
    return text_chunks

# Initialize BM25 Sparse Embedding Model
class SparseEmbeddingModel:
    def __init__(self, corpus):
        self.corpus = [word_tokenize(doc.lower()) for doc in corpus]  # Tokenize documents
        self.bm25 = BM25Okapi(self.corpus)

    def generate_sparse_embedding(self, query):
        query_tokens = word_tokenize(query.lower())
        scores = self.bm25.get_scores(query_tokens)
        embedding = {word: score for word, score in zip(query_tokens, scores) if score > 0}
        return embedding

# Download HuggingFace Embeddings
def download_hugging_face_embeddings():
    return HuggingFaceEmbeddings(model_name='neuml/pubmedbert-base-embeddings')

# Index Documents in Pinecone
def index_documents_in_pinecone(text_chunks, index_name, embeddings):
    return PineconeVectorStore.from_documents(documents=text_chunks, index_name=index_name, embedding=embeddings)

# Retrieve Documents using Hybrid Search
def hybrid_search(query, bm25_model, retriever, weight_dense=0.7, weight_sparse=0.3, top_k=5):
    # BM25 Sparse Retrieval
    sparse_scores = bm25_model.generate_sparse_embedding(query)

    # Dense Retrieval using Pinecone
    retrieved_docs = retriever.invoke(query)
    
    # Normalize Scores
    max_dense_score = max([doc.metadata.get("score", 1) for doc in retrieved_docs], default=1)
    
    # Hybrid Score Calculation
    hybrid_results = []
    for doc in retrieved_docs:
        dense_score = doc.metadata.get("score", 1) / max_dense_score  # Normalize
        sparse_score = sum(sparse_scores.get(word, 0) for word in word_tokenize(doc.page_content.lower()))
        final_score = (weight_dense * dense_score) + (weight_sparse * sparse_score)

        hybrid_results.append((final_score, doc))

    # Sort by final hybrid score
    hybrid_results.sort(reverse=True, key=lambda x: x[0])
    print(hybrid_results)
    # Return top_k results
    return [doc for _, doc in hybrid_results[:top_k]]

# Create RAG Chain
def setup_rag_chain(retriever):
    llm = OpenAI(temperature=0.4, max_tokens=500)

    system_prompt = """
        You are an AI medical assistant designed to provide accurate, concise, and structured answers to health-related questions.  

        Use the retrieved context to answer the query while ensuring clarity and relevance. If the context does not provide sufficient information, state that you don't know rather than guessing.  

        ### **Response Structure:**  
        Problem Description: Clearly summarize the possible condition based on the query.  
        Possible Causes: List potential reasons for the condition.  
        Recommended Tests (if needed): If further diagnosis is required, suggest relevant medical tests.  
        Treatment Options: Provide possible treatments, including medications, lifestyle changes, or procedures.  

        Guidelines:  
        - Be **direct and precise**—avoid vague or roundabout answers.  
        - If multiple conditions could be relevant, briefly mention them.  
        - If a doctor&apos;s consultation is necessary, state that explicitly.  

        **Context:**  
        {context}
    """

    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{input}")])

    rag_chain = LLMChain(llm=llm, prompt=prompt)
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    return rag_chain

# Main Function to Run the Pipeline
def main():
    print("Initializing Pinecone...")
    pc, index_name = initialize_pinecone()

    print("Loading and processing documents...")
    extracted_data = load_pdf_files()
    text_chunks = split_text(extracted_data)

    print("Downloading embeddings model...")
    embeddings = download_hugging_face_embeddings()

    print("Indexing documents...")
    if not pc.has_index(index_name):
        docsearch = index_documents_in_pinecone(text_chunks, index_name, embeddings)
    else:
        docsearch = PineconeVectorStore.from_existing_index(index_name=index_name, embedding=embeddings)

    print("Setting up BM25 model...")
    bm25_model = SparseEmbeddingModel([chunk.page_content for chunk in text_chunks])

    print("Initializing retriever...")
    retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 5})

    print("Performing hybrid search...")
    query = "Patient has increased opacity in the lung fields. What does that mean?"
    retrieved_docs = hybrid_search(query, bm25_model, retriever)

    print("Setting up RAG chain...")
    rag_chain = setup_rag_chain(retriever)

    print("Generating response...")
    response = rag_chain.invoke({"input": query})
    
    print("\n===== Answer =====\n")
    print(response["answer"])

if __name__ == "__main__":
    main()