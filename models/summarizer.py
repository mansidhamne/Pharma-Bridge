# import json
# from transformers import pipeline

# summarizer = pipeline("summarization", model="Falconsai/medical_summarization")

# def replace_nulls(obj, default_value="N/A"):
#     """Recursively replace None or string 'null' with a default value in dictionaries and lists."""
#     if isinstance(obj, dict):
#         return {k: replace_nulls(v, default_value) for k, v in obj.items()}
#     elif isinstance(obj, list):
#         return [replace_nulls(i, default_value) for i in obj]
#     elif obj is None or obj == "null":  # Handle both Python None and string "null"
#         return default_value
#     else:
#         return obj
    
# def chunk_text(text, tokenizer, max_length=512, stride=256):
#     tokens = tokenizer(text, add_special_tokens=True)
#     input_ids = tokens["input_ids"]

#     chunks = [
#         input_ids[i : i + max_length]
#         for i in range(0, len(input_ids), stride)
#     ]
#     return chunks

# def summarizer_helper(personal_details, blood_report, scan_report, audio_transcription):
#     case_study = f"Personal Details: {personal_details}, Blood Report: {blood_report} Scan Report: {scan_report} Audio Transcription: {audio_transcription}"


#     print(summarizer(case_study, max_length=2000, min_length=1500, do_sample=False))
#     return summarizer(case_study, max_length=2000, min_length=1500, do_sample=False)

# patient = {"_id":{"$oid":"67be34d005118f4f85a9f885"},"name":"John Doe","age":{"$numberInt":"30"},"gender":"Male","transcription":" I am feeling consistent headaches and neck pain for the past week, I have spectacles but I don't wear them very often because the number is very less, headaches last for 1 to 2 hours and usually don't stop until I take some meds since, I am feeling a little bit of body pain too.","scanReading":{"image_type_region":{"modality":"X-ray","anatomical_region":"Chest","positioning":"Sagittal","quality":"Good"},"key_findings":[{"observation":"Increased opacity in the lung fields, suggestive of possible consolidation or fluid accumulation.","severity":"Moderate","size":"N/A","location":"Lungs","_id":{"$oid":"67be2c51c8763ee422bb396a"}}],"diagnostic_assessment":{"primary_diagnosis":"Pneumonia or Pulmonary Edema","confidence":"70%","critical_findings":"Potential respiratory compromise due to lung changes. Requires further evaluation."},"patient_friendly_explanation":"The X-ray shows some changes in your lungs that could be due to an infection like pneumonia or fluid buildup. We need to do more tests to figure out exactly what's going on and how to treat it.","research_context":[{"title":"Radiographic assessment of pneumonia.","link":"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4917493/","_id":{"$oid":"67be2c51c8763ee422bb396b"}}]},"__v":{"$numberInt":"4"},"reportReading":[{"Parameter Name":"Haemoglobin(Hb)","Observed Value":"11.5","Units":"g/dL","Reference Range":"11.0 - 15.0","_id":{"$oid":"67bd4647a6afc8195c89b4f1"}},{"Parameter Name":"Total R.B.C Count","Observed Value":"4.83","Units":"mil./cmm","Reference Range":"3.8 - 4.8","_id":{"$oid":"67bd4647a6afc8195c89b4f2"}},{"Parameter Name":"Total W.B.C Count","Observed Value":"9210","Units":"cells/cu.mm","Reference Range":"4000 - 10000","_id":{"$oid":"67bd4647a6afc8195c89b4f3"}},{"Parameter Name":"Neutrophils","Observed Value":"66","Units":"%","Reference Range":"40.0 - 80.0","_id":{"$oid":"67bd4647a6afc8195c89b4f4"}},{"Parameter Name":"Lymphocytes","Observed Value":"20","Units":"%","Reference Range":"20.0 - 40.0","_id":{"$oid":"67bd4647a6afc8195c89b4f5"}},{"Parameter Name":"Eosinophils","Observed Value":"6","Units":"%","Reference Range":"1.0 - 6.0","_id":{"$oid":"67bd4647a6afc8195c89b4f6"}},{"Parameter Name":"Monocytes","Observed Value":"8","Units":"%","Reference Range":"2.0 - 10.0","_id":{"$oid":"67bd4647a6afc8195c89b4f7"}},{"Parameter Name":"Basophils","Observed Value":"0","Units":"%","Reference Range":"0-2","_id":{"$oid":"67bd4647a6afc8195c89b4f8"}},{"Parameter Name":"Band Cells","Observed Value":"null","Units":"%","Reference Range":"0","_id":{"$oid":"67bd4647a6afc8195c89b4f9"}},{"Parameter Name":"Neutrophils (Absolute Count)","Observed Value":"6079","Units":"cells/micro It","Reference Range":"2000 - 7000","_id":{"$oid":"67bd4647a6afc8195c89b4fa"}},{"Parameter Name":"Lymphocytes (Absolute Count)","Observed Value":"1842","Units":"cells/micro It","Reference Range":"1000 - 3000","_id":{"$oid":"67bd4647a6afc8195c89b4fb"}},{"Parameter Name":"Eosinophils (Absolute Count)","Observed Value":"553","Units":"cells/micro It","Reference Range":"20 - 500","_id":{"$oid":"67bd4647a6afc8195c89b4fc"}},{"Parameter Name":"Monocytes (Absolute Count)","Observed Value":"737","Units":"cells/micro It","Reference Range":"200 - 1000","_id":{"$oid":"67bd4647a6afc8195c89b4fd"}},{"Parameter Name":"Basophils (Absolute Count)","Observed Value":"0","Units":"cells/micro It","Reference Range":"20 - 100","_id":{"$oid":"67bd4647a6afc8195c89b4fe"}},{"Parameter Name":"HCT (Hematocrit)","Observed Value":"39.6","Units":"%","Reference Range":"36 - 46","_id":{"$oid":"67bd4647a6afc8195c89b4ff"}},{"Parameter Name":"MCV(Mean Corpuscular Volume)","Observed Value":"82.0","Units":"fI","Reference Range":"83 - 101","_id":{"$oid":"67bd4647a6afc8195c89b500"}},{"Parameter Name":"MCH(Mean Corpuscular Hb)","Observed Value":"23.7","Units":"pg","Reference Range":"27 - 32","_id":{"$oid":"67bd4647a6afc8195c89b501"}},{"Parameter Name":"MCHC(Mean Corpuscular Hb Conc)","Observed Value":"28.9","Units":"7p/8","Reference Range":"31.5 - 34.5","_id":{"$oid":"67bd4647a6afc8195c89b502"}},{"Parameter Name":"RDW-CV(Red Cell Distribution Width)","Observed Value":"20.6","Units":"%","Reference Range":"11.6 - 14.0","_id":{"$oid":"67bd4647a6afc8195c89b503"}},{"Parameter Name":"PLATELET COUNT","Observed Value":"386000","Units":"/micro It","Reference Range":"150000 - 400000","_id":{"$oid":"67bd4647a6afc8195c89b504"}},{"Parameter Name":"Mean Platelet Volume (MPV)","Observed Value":"11.0","Units":"fI","Reference Range":"7.5 - 10.5","_id":{"$oid":"67bd4647a6afc8195c89b505"}},{"Parameter Name":"Plateletocrit (PCT)","Observed Value":"0.423","Units":"null","Reference Range":"0.164 - 0.264","_id":{"$oid":"67bd4647a6afc8195c89b506"}},{"Parameter Name":"PIt Distribution Width (PDW)","Observed Value":"13.7","Units":"null","Reference Range":"12.8 - 16.8","_id":{"$oid":"67bd4647a6afc8195c89b507"}}]}
# patient_cleaned = replace_nulls(patient)

# blood_report = patient_cleaned['reportReading']
# scan_report = patient_cleaned['scanReading']
# audio_transcription = patient_cleaned['transcription']
# personal_details = f"""Patient is a {patient_cleaned['age']['$numberInt']} year {patient_cleaned["gender"]} person"""

# summarizer_helper(personal_details, blood_report, scan_report, audio_transcription)

from transformers import pipeline

# Load a faster summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def replace_nulls(obj, default_value="N/A"):
    """Recursively replace None or string 'null' with a default value in dictionaries and lists."""
    if isinstance(obj, dict):
        return {k: replace_nulls(v, default_value) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_nulls(i, default_value) for i in obj]
    elif obj is None or obj == "null":  # Handle both Python None and string "null"
        return default_value
    else:
        return obj

def summarizer_helper(personal_details, blood_report, scan_report, audio_transcription):
    case_study = f"Personal Details: {personal_details}, Blood Report: {blood_report} Scan Report: {scan_report} Audio Transcription: {audio_transcription}"

    summary = summarizer(case_study, max_length=500, min_length=200, do_sample=False)
    print(summary)
    return summary

patient = {"_id":{"$oid":"67be34d005118f4f85a9f885"},"name":"John Doe","age":{"$numberInt":"30"},"gender":"Male","transcription":" I am feeling consistent headaches and neck pain for the past week, I have spectacles but I don't wear them very often because the number is very less, headaches last for 1 to 2 hours and usually don't stop until I take some meds since, I am feeling a little bit of body pain too.","scanReading":{"image_type_region":{"modality":"X-ray","anatomical_region":"Chest","positioning":"Sagittal","quality":"Good"},"key_findings":[{"observation":"Increased opacity in the lung fields, suggestive of possible consolidation or fluid accumulation.","severity":"Moderate","size":"N/A","location":"Lungs","_id":{"$oid":"67be2c51c8763ee422bb396a"}}],"diagnostic_assessment":{"primary_diagnosis":"Pneumonia or Pulmonary Edema","confidence":"70%","critical_findings":"Potential respiratory compromise due to lung changes. Requires further evaluation."},"patient_friendly_explanation":"The X-ray shows some changes in your lungs that could be due to an infection like pneumonia or fluid buildup. We need to do more tests to figure out exactly what's going on and how to treat it.","research_context":[{"title":"Radiographic assessment of pneumonia.","link":"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4917493/","_id":{"$oid":"67be2c51c8763ee422bb396b"}}]},"__v":{"$numberInt":"4"},"reportReading":[{"Parameter Name":"Haemoglobin(Hb)","Observed Value":"11.5","Units":"g/dL","Reference Range":"11.0 - 15.0","_id":{"$oid":"67bd4647a6afc8195c89b4f1"}},{"Parameter Name":"Total R.B.C Count","Observed Value":"4.83","Units":"mil./cmm","Reference Range":"3.8 - 4.8","_id":{"$oid":"67bd4647a6afc8195c89b4f2"}},{"Parameter Name":"Total W.B.C Count","Observed Value":"9210","Units":"cells/cu.mm","Reference Range":"4000 - 10000","_id":{"$oid":"67bd4647a6afc8195c89b4f3"}},{"Parameter Name":"Neutrophils","Observed Value":"66","Units":"%","Reference Range":"40.0 - 80.0","_id":{"$oid":"67bd4647a6afc8195c89b4f4"}},{"Parameter Name":"Lymphocytes","Observed Value":"20","Units":"%","Reference Range":"20.0 - 40.0","_id":{"$oid":"67bd4647a6afc8195c89b4f5"}},{"Parameter Name":"Eosinophils","Observed Value":"6","Units":"%","Reference Range":"1.0 - 6.0","_id":{"$oid":"67bd4647a6afc8195c89b4f6"}},{"Parameter Name":"Monocytes","Observed Value":"8","Units":"%","Reference Range":"2.0 - 10.0","_id":{"$oid":"67bd4647a6afc8195c89b4f7"}},{"Parameter Name":"Basophils","Observed Value":"0","Units":"%","Reference Range":"0-2","_id":{"$oid":"67bd4647a6afc8195c89b4f8"}},{"Parameter Name":"Band Cells","Observed Value":"null","Units":"%","Reference Range":"0","_id":{"$oid":"67bd4647a6afc8195c89b4f9"}},{"Parameter Name":"Neutrophils (Absolute Count)","Observed Value":"6079","Units":"cells/micro It","Reference Range":"2000 - 7000","_id":{"$oid":"67bd4647a6afc8195c89b4fa"}},{"Parameter Name":"Lymphocytes (Absolute Count)","Observed Value":"1842","Units":"cells/micro It","Reference Range":"1000 - 3000","_id":{"$oid":"67bd4647a6afc8195c89b4fb"}},{"Parameter Name":"Eosinophils (Absolute Count)","Observed Value":"553","Units":"cells/micro It","Reference Range":"20 - 500","_id":{"$oid":"67bd4647a6afc8195c89b4fc"}},{"Parameter Name":"Monocytes (Absolute Count)","Observed Value":"737","Units":"cells/micro It","Reference Range":"200 - 1000","_id":{"$oid":"67bd4647a6afc8195c89b4fd"}},{"Parameter Name":"Basophils (Absolute Count)","Observed Value":"0","Units":"cells/micro It","Reference Range":"20 - 100","_id":{"$oid":"67bd4647a6afc8195c89b4fe"}},{"Parameter Name":"HCT (Hematocrit)","Observed Value":"39.6","Units":"%","Reference Range":"36 - 46","_id":{"$oid":"67bd4647a6afc8195c89b4ff"}},{"Parameter Name":"MCV(Mean Corpuscular Volume)","Observed Value":"82.0","Units":"fI","Reference Range":"83 - 101","_id":{"$oid":"67bd4647a6afc8195c89b500"}},{"Parameter Name":"MCH(Mean Corpuscular Hb)","Observed Value":"23.7","Units":"pg","Reference Range":"27 - 32","_id":{"$oid":"67bd4647a6afc8195c89b501"}},{"Parameter Name":"MCHC(Mean Corpuscular Hb Conc)","Observed Value":"28.9","Units":"7p/8","Reference Range":"31.5 - 34.5","_id":{"$oid":"67bd4647a6afc8195c89b502"}},{"Parameter Name":"RDW-CV(Red Cell Distribution Width)","Observed Value":"20.6","Units":"%","Reference Range":"11.6 - 14.0","_id":{"$oid":"67bd4647a6afc8195c89b503"}},{"Parameter Name":"PLATELET COUNT","Observed Value":"386000","Units":"/micro It","Reference Range":"150000 - 400000","_id":{"$oid":"67bd4647a6afc8195c89b504"}},{"Parameter Name":"Mean Platelet Volume (MPV)","Observed Value":"11.0","Units":"fI","Reference Range":"7.5 - 10.5","_id":{"$oid":"67bd4647a6afc8195c89b505"}},{"Parameter Name":"Plateletocrit (PCT)","Observed Value":"0.423","Units":"null","Reference Range":"0.164 - 0.264","_id":{"$oid":"67bd4647a6afc8195c89b506"}},{"Parameter Name":"PIt Distribution Width (PDW)","Observed Value":"13.7","Units":"null","Reference Range":"12.8 - 16.8","_id":{"$oid":"67bd4647a6afc8195c89b507"}}]}
patient_cleaned = replace_nulls(patient)

blood_report = patient_cleaned['reportReading']
scan_report = patient_cleaned['scanReading']
audio_transcription = patient_cleaned['transcription']
personal_details = f"""Patient is a {patient_cleaned['age']['$numberInt']} year {patient_cleaned["gender"]} person"""

summarizer_helper(personal_details, blood_report, scan_report, audio_transcription)
