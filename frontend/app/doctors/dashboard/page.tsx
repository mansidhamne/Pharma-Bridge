"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import green_background from '../../../public/green-background.png';
import DoctorSidebar from '@/components/common/DoctorSidebar';
import axios from 'axios';
import xray from '../../../../model/scan_uploads/10_IM-0002-1001.dcm.png'

type Report = {
    "Parameter Name": string;
    "Units": string;
    "Reference Range": string;
    "Observed Value": string;
};

type Scan = {
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

type Patient = {
    _id: string;
    name: string;
    age: number;
    gender: string;
    transcription: string;
    reportReading: Report[];
    scanReading: Scan;
}

const DoctorPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async() => {
        try {
            const { data } = await axios.get("http://localhost:3001/api/patients");
            setPatients(data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };
    fetchPatients();
    }, []);

    useEffect(() => {
      if (selectedPatient) {
        const fetchPatientDetails = async () => {
          try {
            const { data } = await axios.get(`http://localhost:3001/api/patients/${selectedPatient}`);
            setPatientData(data);
          } catch (error) {
            console.error("Error fetching patient details:", error);
          }
        };
        fetchPatientDetails();
      } else {
        setPatientData(null);
      }
    }, [selectedPatient]);

    const handlePatientChange = (e) => {
        setSelectedPatient(e.target.value);
    };

    const handleSummarizer = async () => {
      try {
          const response = await axios.post("http://127.0.0.1:3002/summarize-report", {
              reportReading: patientData?.reportReading,
              scanReading: patientData?.scanReading,
              transcription: patientData?.transcription,
          });
          alert(response.data.summary);
          setSummary(response.data.summary);
      } catch (error) {
          console.error("Error summarizing report:", error);
      }
    };

  return (
    <div className="flex flex-row w-screen">
      <DoctorSidebar />
      <div className="flex flex-col">
        <div className="relative w-[1160px] h-[128px]">
          <Image src={green_background} alt="Pharma Bridge" layout="fill" objectFit="cover" />
          <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">DASHBOARD</h1>
        </div>
        
        <div className="max-w-full justify-center flex flex-row space-x-4 mt-10 mx-10">
            <select
                value={selectedPatient}
                onChange={handlePatientChange}
                className="w-full p-2 border border-green-800 rounded text-green-900"
            >
                <option value="">All Patients</option>
                {patients && patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                    {patient.name}
                    </option>
                ))}
            </select>
            <button className="bg-green-600 text-white font-medium p-2 rounded" onClick={handleSummarizer}>Summarize</button>
        </div>
        {summary && (
          <div className="p-10 border rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4 text-emerald-800">Summary</h2>
            <p>{summary}</p>
          </div>
        )}
        {patientData && (
        <div className="p-10 flex flex-col space-y-6">
          {/* Display Blood Reports */}
          <div className="border p-6 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4 text-emerald-800">Blood Reports</h2>
            <ul>
              {patientData.reportReading.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200 text-base">
                      <th className="border-r border-slate-100 p-2">Parameter Name</th>
                      <th className="border-r border-slate-100 p-2">Observed Value</th>
                      <th className="border-r border-slate-100 p-2">Units</th>
                      <th className="border-r border-slate-100 p-2">Reference Range</th>
                      <th className="border p-2">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientData.reportReading.map((report, index) => (  
                      <tr key={index}>
                        <td className="border p-2">{report["Parameter Name"]}</td>
                        <td className="border p-2">{report["Observed Value"]}</td>
                        <td className="border p-2">{report.Units}</td>
                        <td className="border p-2">{report["Reference Range"]}</td>
                        <td className="border text-center font-medium">{parseFloat(report["Observed Value"]) < parseFloat(report["Reference Range"].split('-')[0]) || parseFloat(report["Observed Value"]) > parseFloat(report["Reference Range"].split('-')[1]) ? (
                                  <p className="text-red-500">ALARM</p>
                                  ) : (
                                      <p className="text-green-500">NORMAL</p>
                                  )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No reports available</p>
              )}
            </ul>
          </div>

          {/* Display Scans */}
          <div className="border p-6 rounded-lg shadow-md bg-white">
              <h2 className="text-xl font-semibold mb-4 text-emerald-800">Scans (MRI, CT, etc.)</h2>
                {patientData.scanReading ? (
                    <div>   
                          <h3 className="mx-8 text-xl my-2 font-semibold text-emerald-600">1. Image Type & Region</h3>
                            <div className="flex flex-row justify-between mr-16">
                                <div className="ml-16 flex flex-col space-y-1">
                                    <p className="text-lg"><b>Modality:</b> {patientData.scanReading.image_type_region.modality}</p>
                                    <p className="text-lg"><b>Anatomical Region:</b> {patientData.scanReading.image_type_region.anatomical_region}</p>
                                    <p className="text-lg"><b>Positioning:</b> {patientData.scanReading.image_type_region.positioning}</p>
                                    <p className="text-lg"><b>Quality:</b> {patientData.scanReading.image_type_region.quality}</p>
                                </div>
                                <Image src={xray} alt="Pharma Bridge" width={250} height={250} />
                            </div>
                            <div className="mx-8 bg-blue-900/50 h-0.5 my-6"></div>
                            <h3 className="mx-8 text-xl my-2 font-semibold text-emerald-600">2. Key Findings</h3>
                                {patientData.scanReading.key_findings.map((finding, index) => (
                                    <div key={index} className='mr-40 ml-16'>
                                        <p className="text-lg"><b>Observation:</b> {finding.observation}</p>
                                        <p className="text-lg"><b>Severity:</b> {finding.severity}</p>
                                        <p className="text-lg"><b>Size:</b> {finding.size}</p>
                                        <p className="text-lg"><b>Location:</b> {finding.location}</p>
                                        {index !== patientData.scanReading.key_findings.length - 1 ? (<div className="bg-blue-900/50 h-0.5 my-4"></div>) : null}
                                    </div>
                                ))}
                            <div className="mx-8 bg-blue-900/50 h-0.5 my-6"></div>
                            <h3 className="mx-8 text-xl my-2 font-semibold text-emerald-600">3. Diagnostic Assessment</h3>
                                <div className="ml-16">
                                    <p className="text-lg"><b>Primary Diagnosis:</b> {patientData.scanReading.diagnostic_assessment.primary_diagnosis}</p>
                                    <p className="text-lg"><b>Confidence:</b> {patientData.scanReading.diagnostic_assessment.confidence}</p>
                                    <p className="text-lg"><b>Critical Findings:</b> {patientData.scanReading.diagnostic_assessment.critical_findings}</p>
                                </div>
                            {/* <div className="mx-8 bg-blue-900/50 h-0.5 my-6"></div> */}
                            {/* <h3 className="mx-8 text-xl my-2 font-semibold text-emerald-600">4. Patient-Friendly Explanation</h3>
                                <div className="ml-16 mr-16">
                                    <p className="text-lg">{patientData.scanReading.patient_friendly_explanation}</p>
                                </div> */}
                                
                            <div className="mx-8 bg-blue-900/50 h-0.5 my-6"></div>
                            <h3 className="mx-8 text-xl my-2 font-semibold text-emerald-600">4. Research Context</h3>
                            {patientData.scanReading.research_context.map((article, index) => (
                              <p key={index} className="text-lg ml-16">
                                  <a href={article.link} target="_blank" className="underline text-violet-600">{article.title}</a>
                              </p>
                            ))}
                      </div>
                  ) : (
                    <p className="text-lg font-semibold text-emerald-900">No scans available</p>
                  )}
            </div>

          {/* Display Audio Transcriptions */}
          <div className="border p-6 rounded-lg shadow-md bg-white">
              <h2 className="text-xl font-semibold mb-4 text-emerald-800">Audio Transcriptions</h2>
              <ul>
                {patientData.transcription ? (
                  <li className="mb-2">
                    <p className="text-gray-700">{patientData.transcription}</p>
                  </li>
                ) : (
                  <p>No transcriptions available</p>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPage;
