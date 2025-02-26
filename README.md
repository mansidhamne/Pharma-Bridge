# Pharma Bridge
Bridging Pharmacy Excellence with Diagnostic Precision

This application is built to aid 3 department of the healthcare domain - Patient, Doctor and Pharmacist.

## Features for the Patient:
- Patient can upload their blood reports (images/pdf) on to the portal. OCR is perfomed on the report using a custom library PaddleOCRX built on top of [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR).
- The extracted text is a .txt file whose content is passed through an LLM (Gemini Pro) to return a dataframe of only the report readings.
  ```[Parameter Name, Observed Value, Units, Reference Range]```is returned for each row in the report.
- Based on the Observed Value and Reference Range, the blood report readings are highlighted if required which makes it easier to read the report and focus on the things that require attention.
- The patient can also upload his scans like X-Rays, MRI's etc. The file is uploaded to Gemini and an Agent is run. The Agent uses ```DuckDuckGoTools()``` which scours relevant literature. The Agent returns the following JSON:
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
- The patient can also upload an audio recording of their symptoms which is transcribed using OpenAI's Whisper which has a WER rate of 9.9% on English and provides multi-lingual transcription, make it more comfortable for patient to share their problems.

## Features for the Doctor
- The doctor can view all the details given by the patient.
- Doctor has a summarizer option which is done using ```facebook/bart-large-cnn``` that takes in the personal details like age, gender, lifestyle of the patient along with case details like blood reports, symptoms and scan readings.
- The doctor also has access to a RAG Based Chatbot which implements hybrid search.
    - The database for this was a medical book consisiting symptoms, 
  
