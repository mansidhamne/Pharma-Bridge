from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai  # Import Gemini API
from agno.agent import Agent, RunResponse
from agno.media import Image  
from agno.models.google import Gemini
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.utils.pprint import pprint_run_response
from google.generativeai import upload_file, get_file
import time
import re
from fuzzywuzzy import process
from ocr_tool import run_ocr
import json
import requests
from dotenv import load_dotenv
import whisper
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication
load_dotenv()
app.config["GOOGLE_API_KEY"] = os.environ.get("GOOGLE_API_KEY")
print(app.config["GOOGLE_API_KEY"])

UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

os.environ["GOOGLE_API_KEY"] = "GOOGLE_API_KEY"

agent = Agent(
        model=Gemini(
            id="gemini-2.0-flash-exp",
        ),
        tools=[DuckDuckGoTools()],
        markdown=True,
    )

# clinic_details = """
# Clinic Name: Megha's Ayur World
# Type: Ayurvedic Clinic & Panchkarma Centre
# Timings: Monday to Sunday, 10am to 8.30pm
# Contact: Mo-9224451130
# Doctor Name: Dr.Shalini A.Dhamne
# Qualification: B.A.M.S.(Ayurvedacharya)
# Registration Number: RegNo.1-42334-A-1
# Address: 32/224, Ajinkya Tara Society, Shivai Nagar, Pokharan Road 1, Thane (West)
# """

# patient_details = {
#     "Patient Name": "John Doe",
#     "Age": 30,
#     "Gender": "Male",
#     "Diagnosis": "Fever, Headache",  
#     "Comments": "Patient is advised to take rest and drink plenty of fluids." 
# }

def extract_clinic_details(ocr_text):
    """Extract structured clinic details using Gemini API."""
    prompt = f"""
    Extract structured clinic and doctor details from the given text.
    Ignore any garbled or irrelevant words.

    Text:
    {ocr_text}

    Output format is a json object with the following keys:
    Clinic Name:
    Type:
    Timings:
    Contact:
    Doctor Name:
    Qualification:
    Registration Number:
    Address:
    """
    
    response = model.generate_content(prompt)
    return response.text.strip() if response else "No details extracted."

def extract_patient_details(ocr_text):
    prompt = f"""
    Extract structured patient details from the given text.
    Ignore any garbled or irrelevant words.

    Text:
    {ocr_text}

    Output format is a json object with the following keys:
    Patient Name:
    Age:
    Gender:
    Diagnosis:
    Comments:
    """

    response = model.generate_content(prompt)
    return response.text.strip() if response else "No details extracted."

def tokenize(text):
    """Extract words and numbers as a set."""
    return set(re.findall(r'\b[a-zA-Z0-9-]+\b', text.lower()))

def extract_handwritten_text(ocr_text, clinic_details):
    """Extract handwritten text by removing printed clinic details."""
    details_set = tokenize(clinic_details)
    ocr_text_set = tokenize(ocr_text)
    handwritten_text = ocr_text_set - details_set
    return " ".join(handwritten_text).replace(" ", "\n")

def match_medicine(name, inventory, threshold=70):
    """Fuzzy match a medicine name from the reference list."""
    match, score = process.extractOne(name, inventory)
    return match if score >= threshold else None

def extract_medicines(handwritten_text, inventory):
    """Extract medicine details from handwritten text."""
    lines = handwritten_text.lower().split('\n')
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    
    medicine_details = []
    current_medicine = None

    for line in cleaned_lines:
        matched_medicine = match_medicine(line, inventory)
        if matched_medicine:
            current_medicine = {'name': matched_medicine}
            medicine_details.append(current_medicine)

    return medicine_details

def clean_text_to_json(text):
    """Clean extracted clinic details."""
    # Remove markdown and extra newlines
    clean_text = re.sub(r"```json|```JSON|```", "", text).strip()

    try:
        # Convert string to JSON
        json_data = json.loads(clean_text)
        return json_data  # Returns structured JSON
    except json.JSONDecodeError:
        print("⚠️ Failed to parse JSON, returning raw text.")
        return {"error": "Invalid JSON format", "rawText": clean_text}

@app.route("/get-ocr", methods=["GET"])
def get_ocr():
    results = run_ocr(
        input_folder=UPLOAD_FOLDER,
        output_folder=RESULTS_FOLDER,
        sort_along="row",
        lang="en",
        save_as="text",
        clean_text=False,
        input_type="image"
    )
    
    return jsonify({"ocr": results})

def get_inventory():
    try:
        response = requests.get("http://localhost:3001/api/medicines/all")
        response.raise_for_status() 
        inventory = response.json()
        inventory_names = [item["name"] for item in inventory]
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    return inventory_names

@app.route("/upload", methods=["POST"])
def upload_prescription():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
        
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    folder_file_name = file.filename
    folder_name = folder_file_name.split(".")[0]
    ocr_text_file = os.path.join(RESULTS_FOLDER, folder_name, f"extracted_text_1.txt")
    print(ocr_text_file)
    if os.path.exists(ocr_text_file):
        with open(ocr_text_file, "r") as f:
            ocr_text = f.read()
    else:
        ocr_text = "No OCR text found"

    medicine_inventory = get_inventory()
    # print(medicine_inventory)

    patient_details = {
        "Patient Name": "John Doe",
        "Age": 30,
        "Gender": "Male",
        "Diagnosis": "Fever, Headache",  
        "Comments": "Patient is advised to take rest and drink plenty of fluids." 
    }

    # clinic_details = extract_clinic_details(ocr_text)
    clinic_details = """```json\n{\n  \"Clinic Name\": \"Megha's Ayur World\",\n  \"Type\": \"Ayurvedic Clinic & Panchkarma Centre\",\n  \"Timings\": \"Monday to Sunday 10am to 8.30pm\",\n  \"Contact\": \"9224451130\",\n  \"Doctor Name\": \"Dr. Mrs. Shalini A. Dhamne\",\n  \"Qualification\": \"B.A.M.S. (Ayurvedacharya\",\n  \"Registration Number\": \"1-42334-A-1\",\n  \"Address\": \"32/224, Ajinkya Tara Society, Shivai Nagar, Pokharan Road 1, Thane (West)\"\n}\n```"""
    # print(clinic_details)
    # patient_details = extract_patient_details(ocr_text)
    # print(patient_details)
    cleaned_clinic_details = clean_text_to_json(clinic_details)
    # cleaned_patient_details = clean_text_to_json(patient_details) 
    handwritten_text = extract_handwritten_text(ocr_text, clinic_details)
    # print(handwritten_text)
    medicine_list_dict = extract_medicines(handwritten_text, medicine_inventory)
    medicine_list = [item["name"] for item in medicine_list_dict]
    # print(medicine_list)

    response_data = {
        "message": f"File Uploaded Successfully: {file_path}",
        "ocr_text": ocr_text,
        "clinicalDetails": cleaned_clinic_details,
        "patientDetails": patient_details,
        "medicines": medicine_list
    }

    return jsonify(response_data), 200

@app.route("/check-drug-interactions", methods=["POST"])
def drug_interaction_checker():
    data = request.get_json()
    medicines = [item["name"] for item in data]
    print(medicines)
    
    if not medicines:
        return jsonify({"error": "No medicines provided"}), 400
    
    prompt = (f"Check for drug interactions between {', '.join(medicines)}. "
              "What drug interactions should the patient be aware of while taking these tablets? "
              "Give proper suggestions on how to reduce the consequences if it's a bad combination."
              "End the response with: Consult your doctor if serious side effects are observed"
            )
    
    try:
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "medllama2",
            "prompt": prompt,
            "stream": False
        })
        response.raise_for_status()
        
        interactions = response.json()
        return jsonify({"response": interactions.get("response", "No response received")})
    
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    file_path = f"./audio_uploads/{audio_file.filename}"
    os.makedirs("./audio_uploads", exist_ok=True)
    audio_file.save(file_path)

    model = whisper.load_model("base")
    result = model.transcribe(file_path)

    return jsonify({"transcription": result['text']}), 200

@app.route("/report-ocr", methods=["POST"])
def ocr_report():
    if "report" not in request.files:  # Change 'file' to 'report'
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["report"]  # Change 'file' to 'report'
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    file_path = os.path.join("report_uploads", file.filename)
    print("filename", file.filename)
    os.makedirs("report_uploads", exist_ok=True)
    file.save(file_path)
    
    run_ocr(
        input_folder="report_uploads",
        output_folder="report_results",
        sort_along="row",
        lang="en",
        save_as="text",
        clean_text=False,
        input_type="pdf"
    )

    foldername = file.filename.split(".")[0]
    with open(f"report_results/{foldername}/extracted_text_1.txt", "r") as f:
        ocr_text = f.read()

    def extract_and_execute_python_code(response):
        match = re.search(r"```python\n(.*?)```", response, re.DOTALL)
        if match:
            python_code = match.group(1)  # Extracted Python code
            print("Extracted Python Code:\n", python_code)  # Debugging step

            local_vars = {}
            exec(python_code, {}, local_vars)

            # Get the DataFrame
            report_readings = local_vars.get("df")
            if report_readings is None:
                raise ValueError("DataFrame (df) not found in executed code.")
            
            return report_readings
        else:
            raise ValueError("No Python code found in the response.")



    def get_report_details(text):
        prompt = f"""
        Parse the OCR text and structure it into a pandas DataFrame where:

        Column 1: Parameter Name
        Column 2: Observed Value
        Column 4: Units
        Column 3: Reference Range

        **Important:**
        - If any "Units" value is missing, store it as "None".
        - Do **not** use variables like `text`, only define a DataFrame (`df`).

        Text:
        {text}

        Example Output:
        import pandas as pd

        # Create a DataFrame with the specified columns
        df = pd.DataFrame(columns=["Parameter Name", "Observed Value", "Units", "Reference Range"])

        data = [
            {{"Parameter Name": "Total R.B.C Count", "Observed Value": "4.83", "Units": "mil./cmm", "Reference Range": "3.8 - 4.8"}}, 
            {{"Parameter Name": "Total W.B.C Count", "Observed Value": "9210", "Units": "cells/cu.mm", "Reference Range": "4000 - 10000"}}, 
            {{"Parameter Name": "Neutrophils", "Observed Value": "66", "Units": "%", "Reference Range": "40.0 - 80.0"}}, 
        ]
        df = pd.concat([df, pd.DataFrame(data)], ignore_index=True)

        # Print the DataFrame
        print(df)

        Give the python code as an output. Don't include any other text. Start the output with ```python and end with ```.
        """
    
        response = model.generate_content(prompt)
        return response.text.strip() if response else "No details extracted."

    report_details = get_report_details(ocr_text)
    report_readings = extract_and_execute_python_code(report_details)
    report_json = report_readings.to_dict(orient="records")
    return jsonify({
        "ocr": "Successful",
        "report_readings": report_json
    })

@app.route("/upload-scan", methods=["POST"])
def upload_scan():
    if "scan" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["scan"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join("scan_uploads", file.filename)
    print("filename", file.filename)
    os.makedirs("scan_uploads", exist_ok=True)
    file.save(file_path)

    response = analyse_scan(file_path)

    return jsonify({
        "message": f"File Uploaded Successfully: {file_path}",
        "scan_readings": response
    })

def analyse_scan(file_path):
    try:
        print(file_path)
        uploaded_file = genai.upload_file(file_path)
        print(uploaded_file)

        while uploaded_file.state.name == "PROCESSING":
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)
        print(uploaded_file)

        scan_response = {
            "image_type_region": {},
            "key_findings": [],
            "diagnostic_assessment": {},
            "patient_friendly_explanation": "",
            "research_context": []
        }

        result: RunResponse = agent.run("""
                You are a highly skilled medical imaging expert. Analyze the scan and return a structured JSON response:

                {
                "image_type_region": {
                    "modality": "MRI/CT/X-ray",
                    "anatomical_region": "Brain/Chest/Abdomen",
                    "positioning": "Axial/Sagittal",
                    "quality": "Good/Poor"
                },
                "key_findings": [
                    {
                    "observation": "Description of finding",
                    "severity": "Mild/Moderate/Severe",
                    "size": "2.5 cm",
                    "location": "Left frontal lobe",
                    "density": "Hypointense"
                    }
                ],
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
                    "link": "https://example.com" #add the actual link here
                    }
                ]
                }
                """,
                images=[
                    Image(
                        filepath=file_path
                    )
                ],
                stream=False,
            )
        
        pprint_run_response(result)

        # response_text = ""
        # for chunk in result:
        #     response_text += chunk

        # Debugging: Print the raw response received
        print("Raw AI Response:", result.content)

        # Extract JSON from the response
        json_start = result.content.find("{")
        json_end = result.content.rfind("}") + 1
        json_str = result.content[json_start:json_end]
        print("Extracted JSON:", json_str)

        # Parse JSON properly
        scan_response = json.loads(json_str)
        print("Parsed JSON:", scan_response)

        return scan_response
    
    except Exception as e:
        return f"Error in processing: {str(e)}"
    
if __name__ == "__main__":
    app.run(port=3002, debug=True)
