const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: "mongodb+srv://mansidhamne22:mansidhamne22@cluster0.8pedm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    file: (req, file) => {
      return {
        filename: 'file_' + Date.now() + '_' + file.originalname,
        bucketName: 'uploads', // This is the default bucket name in GridFS
      };
    },
});
  
const upload = multer({ storage });

router.get("/", async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: "Error fetching patients" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        res.status(200).json(patient);
    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).json({ message: "Error fetching patient details", error });
    }
});

router.post("/store-transcription", async (req, res) => {
    const { patientName, age, gender, transcription, reportReading, scanReading } = req.body;

    try {
        let patient = await Patient.findOne({ name: patientName });
        if (patient) {
            patient.transcription = transcription;
        } else {
            patient = new Patient({ 
                name: patientName, 
                age,
                gender, 
                transcription, 
                reportReading: reportReading || [], 
                scanReading: scanReading || [] 
            });
        }
        await patient.save();
        res.status(200).json({ message: "Transcription saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error saving transcription" });
    }
});

router.post("/store-report", upload.single('report'), async (req, res) => {
    const { patientName, reportReading } = req.body;

    try {
        let patient = await Patient.findOne({ name: patientName });
        if (patient) {
            patient.reportReading = reportReading;
        } else {
            patient = new Patient({ name: patientName, age, gender, transcription: transcription || "", reportReading, scanReading: scanReading || [], reportFileId: req.file.id, scanFileId: scanFileId || null });
        }
        await patient.save();
        res.status(200).json({ message: "Report saved successfully", fileId: req.file.id });
    } catch (error) {     
        res.status(500).json({ error: "Error saving report" });
    }  
});

router.post("/store-scan", async (req, res) => {
    const { patientName, scanReading } = req.body;

    try {
        let patient = await
        Patient.findOne({ name: patientName });
        if (patient) {
            patient.scanReading = scanReading;
        } else {
            patient = new Patient({ name: patientName, age, gender, transcription: transcription || "", reportReading: reportReading || [], scanReading, reportFileId: reportFileId || null, scanFileId: req.file.id });
        }
        await patient.save();
        res.status(200).json({ message: "Scan saved successfully", fileId: req.file.id });
    } catch (error) {
        res.status(500).json({ error: "Error saving scan" });
    }
});

module.exports = router;