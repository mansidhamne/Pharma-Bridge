"use client";
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import blue_background from '../../../public/blue_background.png';
import PatientSidebar from '@/components/common/PatientSidebar';
import xray from '../../../../model/scan_uploads/10_IM-0002-1001.dcm.png';

type ReportReading = {
    "Parameter Name": string;
    "Observed Value": string;
    "Reference Range": string;
    "Units": string;
}

type ScanReading = {
    image_type_region: {
        modality: string;
        anatomical_region: string;
        positioning: string;
        quality: string;
    };
    key_findings: {
        observation: string;
        severity: string;
        size: string;
        location: string;
    }[];
    diagnostic_assessment: {
        primary_diagnosis: string;
        confidence: string;
        critical_findings: string;
    };
    patient_friendly_explanation: string;
    research_context: {
        title: string;
        link: string;
    }[];
}

const PatientPage = () => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [transcription, setTranscription] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [reportReadings, setReportReadings] = useState<ReportReading[]>([]);
    const [scanReadings, setScanReadings] = useState<ScanReading>();
    const [loading, setLoading] = useState(false);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const file = new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" });
            setSelectedFile(file);
            setAudioURL(URL.createObjectURL(audioBlob));
        };

        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    const handleAudioFileUpload = async () => {
        if (!selectedFile) return alert("Please record or upload an audio file.");
        
        const formData = new FormData();
        formData.append("audio", selectedFile);
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:3002/transcribe", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTranscription(response.data.transcription);

            // Store transcription in the patient’s profile via Node.js backend
            await axios.post("http://localhost:3001/api/patients/store-transcription", {
                patientName: "John Doe",  
                age: 30,
                gender: "Male",
                transcription: response.data.transcription,
            });

        } catch (error) {
            console.error("Error uploading audio:", error);
        }
        setLoading(false);
    };

    const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append("report", file);

        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:3002/report-ocr", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            //alert(response.data.ocr);
            setReportReadings(response.data.report_readings);
            await axios.post("http://localhost:3001/api/patients/store-report", {
                patientName: "John Doe",
                age: 30,
                gender: "Male",
                reportReading: response.data.report_readings,
                reportFileId: response.data.file._id,
            });
        } catch (error) {
            console.error("Error uploading report:", error);
        }
        setLoading(false);
    };

    const handleScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append("scan", file);

        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:3002/upload-scan", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            //alert(response.data.ocr);
            setScanReadings(response.data.scan_readings);
            await axios.post("http://localhost:3001/api/patients/store-scan", {
                patientName: "John Doe",
                age: 30,
                gender: "Male",
                scanReading: response.data.scan_readings,
                scanFileId: response.data.file._id
            });
        } catch (error) {
            console.error("Error uploading scan:", error);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-row w-screen">
            <PatientSidebar />
            <div className="flex flex-col">
                <div className="relative w-[1160px] h-[128px]">
                    <Image src={blue_background} alt="Pharma Bridge" layout="fill" objectFit="cover" />
                    <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">
                        DASHBOARD
                    </h1>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Upload Blood Reports */}
                    <div className="border p-6 rounded-lg shadow-md bg-white">
                        <h2 className="text-xl font-semibold mb-4">Upload Blood Reports</h2>
                        <input type="file" onChange={handleReportUpload} accept=".pdf,.jpg,.png" className="w-full p-2 border rounded" />
                        {loading && <p className="text-sm text-gray-500 mt-2">Uploading Report...</p>}
                    </div>

                    {/* Upload Scans */}
                    <div className="border p-6 rounded-lg shadow-md bg-white">
                        <h2 className="text-xl font-semibold mb-4">Upload Scans (MRI, CT, etc.)</h2>
                        <input type="file" onChange={handleScanUpload} accept=".pdf,.jpg,.png" className="w-full p-2 border rounded" />
                        {loading && <p className="text-sm text-gray-500 mt-2">Uploading Report...</p>}
                    </div>

                    {/* Upload Audio Description */}
                    <div className="border p-6 rounded-lg shadow-md bg-white">
                        <h2 className="text-xl font-semibold mb-4">Upload Audio Description</h2>
                        <input
                            type="file"
                            accept=".mp3,.wav"
                            className="w-full p-2 border rounded"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-center font-semibold text-blue-700 my-2">OR</p>
                        <button onClick={recording ? stopRecording : startRecording}
                                className="w-full p-2 border rounded bg-blue-700 text-white font-semibold">
                            {recording ? "Stop Recording" : "Start Recording"}
                        </button>
                        {audioURL && <audio controls className="mt-4 w-full"><source src={audioURL} type="audio/wav" /></audio>}
                        <button onClick={handleAudioFileUpload} className="w-full p-2 mt-4 border rounded bg-green-500 text-white font-semibold">
                            Send To Doctor
                        </button>
                    </div>
                </div>
                <div>
                    {transcription && (
                        <div className="mx-10 mb-4 border shadow bg-blue-50 p-4">
                            <h1 className="text-2xl font-semibold text-blue-700">Transcription</h1>
                            <p className="mt-2.5 p-2 font-medium text-base">{transcription}</p>
                        </div>
                    )}
                </div>
                <div>
                    {scanReadings && (
                        <div className="flex flex-row mx-10 mb-4 border shadow bg-blue-50/50 p-6">
                            <div>
                                <h1 className="text-2xl mb-4 font-semibold text-blue-700">Scan Analysis Results</h1>
                                <h3 className="mx-8 text-xl my-2 font-semibold text-blue-900">1. Image Type & Region</h3>
                                    <div className="mr-40 ml-16 flex flex-row items-center justify-between">
                                        <p className="text-lg"><b>Modality:</b> {scanReadings.image_type_region.modality}</p>
                                        <p className="text-lg"><b>Anatomical Region:</b> {scanReadings.image_type_region.anatomical_region}</p>
                                    </div>
                                    <div className="mr-40 ml-16 flex flex-row items-center justify-between">
                                        <p className="text-lg"><b>Positioning:</b> {scanReadings.image_type_region.positioning}</p>
                                        <p className="text-lg"><b>Quality:</b> {scanReadings.image_type_region.quality}</p>
                                    </div>
                                <div className="mx-8 bg-blue-900/50 h-0.5 my-6"></div>
                                <h3 className="mx-8 text-xl my-2 font-semibold text-blue-900">2. Initial Remarks</h3>
                                    <div className="ml-16 mr-16">
                                        <p className="text-lg">{scanReadings.patient_friendly_explanation}</p>
                                    </div>
                            </div>
                            <Image src={xray} alt="Pharma Bridge" width={300} height={300} />
                        </div>
                    )}
                </div>
                <div className="mx-10 mt-2 mb-4">
                    <div className="flex flex-row justify-between items-center mb-2">
                        <h1 className="text-2xl font-bold text-blue-700">Blood Test Report</h1>
                    </div>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 text-base">
                                <th className="border p-2">Parameter Name</th>
                                <th className="border p-2">Observed Value</th>
                                <th className="border p-2">Units</th>
                                <th className="border p-2">Reference Range</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {reportReadings && reportReadings.map((row, index) => (
                            <tr key={index} className="border text-xs">
                                <td className="border p-2">{row["Parameter Name"]}</td>
                                <td className="border p-2">{row["Observed Value"]}</td>
                                <td className="border p-2">{row["Units"]}</td>
                                <td className="border p-2">{row["Reference Range"]}</td>
                                <td className="border text-center font-medium">{parseFloat(row["Observed Value"]) < parseFloat(row["Reference Range"].split('-')[0]) || parseFloat(row["Observed Value"]) > parseFloat(row["Reference Range"].split('-')[1]) ? (
                                    <p className="text-red-500">ALARM</p>
                                    ) : (
                                        <p className="text-green-500">NORMAL</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default PatientPage;
