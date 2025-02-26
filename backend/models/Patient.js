const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    transcription: String,
    reportReading: [{ 
        "Parameter Name": String, 
        "Observed Value": String, 
        Units: String, 
        "Reference Range": String 
    }],
    scanReading: { 
        image_type_region: {
            modality: String,
            anatomical_region: String,
            positioning: String,
            quality: String
        },
        key_findings: [{
            observation: String,
            severity: String,
            size: String,
            location: String
        }],
        diagnostic_assessment: {
            primary_diagnosis: String,
            confidence: String,
            critical_findings: String
        },
        patient_friendly_explanation: String,
        research_context: [{
            title: String,
            link: String
        }]
    },
    reportFileId: { type: mongoose.Schema.Types.ObjectId }, // Reference to the report file in GridFS
    scanFileId: { type: mongoose.Schema.Types.ObjectId }   
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;