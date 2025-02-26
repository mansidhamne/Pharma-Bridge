# Pharma Bridge
Bridging Pharmacy Excellence with Diagnostic Precision

This application is built to aid 3 department of the healthcare domain - Patient, Doctor and Pharmacist.

## Implementation Flow
<img width="838" alt="Screenshot 2025-02-26 at 9 34 15 PM" src="https://github.com/user-attachments/assets/d56f4df4-ab5b-4d38-8c71-c676fecd1361" />

## Prototype 


## Features for the Patient:
- Patient can upload their blood reports (images/pdf) on to the portal. OCR is perfomed on the report using a custom library **PaddleOCRX** built on top of [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR).
- The extracted text is a **.txt** file whose content is passed through an **LLM (Gemini Pro)** to return a dataframe of only the report readings.
  ```[Parameter Name, Observed Value, Units, Reference Range]```is returned for each row in the report.
- Readings that fall outside the reference range are **highlighted** for easier interpretation, helping patients and doctors focus on critical values.
- The patient can also upload his **scans like X-Rays, MRI's etc**. The file is uploaded to Gemini and an **Agent** is run. The Agent uses ```DuckDuckGoTools()``` which scours relevant literature. The Agent returns the following JSON:
  ```
  {
     "image_type_region": {
      "modality": "MRI/CT/X-ray",
      "anatomical_region": "Brain/Chest/Abdomen",
      "positioning": "Axial/Sagittal",
      "quality": "Good/Poor"
     },
    "key_findings": [{
        "observation": "Description of finding",
        "severity": "Mild/Moderate/Severe",
        "size": "2.5 cm",
        "location": "Left frontal lobe",
        "density": "Hypointense"
      }],
     "diagnostic_assessment": {
        "primary_diagnosis": "Diagnosis name",
        "confidence": "85%",
        "differential_diagnoses": ["Alternative Diagnosis 1", "Alternative Diagnosis 2"],
        "critical_findings": "Any urgent issues"
      },
      "patient_friendly_explanation": "Simplified explanation for the patient",
      "research_context": [
      {
        "title": "Relevant research article",
        "link": "https://example.com" 
      }
    ]
  }
  ```
- This JSON is stored in the database against the patient for future reference
- The patient can also **upload an audio recording** of their symptoms which is transcribed using **OpenAI's Whisper** which has a **WER rate of 9.9%** on English and **provides multi-lingual transcription**, make it more comfortable for patient to share their problems.

## Features for the Doctor
- The doctor can view all the details given by the patient.
- A summarization tool powered by ```facebook/bart-large-cnn``` generates concise case summaries. This summary includes:
  - Personal details (age, gender, lifestyle)
  - Clinical details (blood reports, symptoms, scan findings
- Doctors also have access to a **RAG-Based Chatbot** that uses **Hybrid Search** to retrieve medical literature efficiently:
    - The **knowledge base** for this was a medical book consisiting symptoms, treatments and relevant discussion.
    - When the doctor enters the query, the query embeddings are compared with the **sparse embeddings (broad filtering)**. Think of it like multiple buckets. We identify the relevant buckets using sparse embedding and then execute **dense retrieval (precise matching)** in this selected button for more accurate keyword matching and retrieval.
    - This approach enables doctors to quickly interact with medical literature without manually searching through books.

## Features for the Pharmacist
- The pharmacist can upload the image of the **handwritten prescription** from the doctor.
- **PaddleOCRX** extracts information from the image including printed and handwritten text.
- Using Gemini, the extracted text is categorized into **clinic details, patient details and prescibed medicines.**
- The extracted medication list is compared with the **pharmacy's inventory** using **Levenshtein Distance**, setting a similarity threshold to ensure accurate medicine identification. Once verified, the medicines are added to the order.
- The portal also allows the pharmacist to select medicines manually and add it to the Order.
- A **Drug Interaction Checker** powered by ```medllama2``` is available to analyze the **chemical composition** of prescribed drugs, flag potential **allergies or adverse reactions**, and provide **safety recommendations** for patients.
  
## Tech Stack
1. Frontend: Next.js, Tailwind CSS, Shadcn UI, Framer Motion
2. Backend:
   a. Node.js, Express
   b. Flask
3. Database: MongoDB, Pinecone (Vector Database)
4. LLMs: Gemini Pro, OpenAI, medllama2
5. AgentAI: Agno
6. OCR: PaddleOCRX, OpenCV, Numpy, Pandas
7. Others: Hugging Face, transformers

## PaddleOCRX: What is PaddleOCRX? How does it work?
✅ **Standard OCR assumes a clean image; preprocessing ensures text is well-defined, reducing OCR errors.**
1. **Image Preprocessing for Improved OCR Accuracy**: Enhances contrast, reduces noise, and ensures clean input for OCR.
    - Grayscale & CLAHE: Improves local contrast while preventing noise amplification.
    - Adaptive Thresholding: Dynamically binarizes images for better text clarity.
    - Noise Removal: Bilateral filtering preserves edges while reducing artifacts.
    - Future Improvement: Hough Line Transform for automatic skew correction.
      
✅ **Standard OCR loses table structures; this approach adapts to multiple formats, preserving layout.**
2. **Custom Sorting of OCR Results for Table Reconstructio**
- Maintains document structure by sorting extracted text dynamically.
  - Row-wise sorting: Groups text by Y-coordinates (useful for invoices, receipts, blood reports).
  - Column-wise sorting: Groups text by X-coordinates (useful for financial statements, research papers).
- Sorting logic: Clusters text by proximity, ensuring correct reading order.

✅ **Standard OCR struggles with dense text; this improves segmentation and reduces misclassifications.**
3. **Improved Text Localization for Higher Accuracy**: Refines bounding boxes for better word segmentation.
- Bounding Box Post-processing: Merges split words, prevents missing text.
- Multi-pass OCR Processing: Refines text regions in a second pass.
- Text-Region Filtering: Removes unwanted elements like logos or watermarks.

## Getting Started

```
git clone https://github.com/mansidhamne/Pharma-Bridge.git
```

```
cd frontend
npm install
npm run dev
```

```
cd backend
npm install
nodemon server.js
```

In the ```.env``` file, add your MONGODB_URI

```
cd model
pip install -r requirements.txt
python app.py
```

In the ```.env``` file, add your 
  - GEMINI_API_KEY from Google AI Studio
  - PINECONE_API_KEY from Pinecone
  - OPENAI_API_KEY from OpenAI

Install ollama from (https://ollama.com/download)
```
ollama start
ollama run medllama2
```

## Research Aspect

I attempted to implement medical captioning using generative transformers as described in the paper: [Medical Image Captioning via Generative Pretrained Transformers
](https://arxiv.org/abs/2209.13983) This paper introduces a novel approach for automatic clinical caption generation from chest X-ray images. The method combines two language models: **Show-Attend-Tell (SAT) and GPT-3**, to generate structured radiology reports. The SAT model extracts visual features and provides attention-based localization of pathologies, while GPT-3 refines and extends the generated text into a more comprehensive and clinically meaningful report. However, due to hardware and dataset limitations, I wasn’t able to achieve the expected performance. Despite these challenges, I found the approach extremely compelling, and my long-term goal is to fully implement and extend this model to a wider variety of medical images and scans.

## Demo Video
