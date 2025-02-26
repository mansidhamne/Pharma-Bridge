"use client";
import Sidebar from '@/components/common/Sidebar';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import background from '../../public/background.png';
import axios from 'axios';
import { Mail, Printer } from 'lucide-react';
import InteractionModal from '@/components/InteractionModal';

interface Medicine {
    name: string;
    category: string;
    dosage_form: string;
    strength: string;
    price_inr: number;
    manufacturing_company: string;
    indication: string;
    classification: string;
    quantity_in_stock: number;
}

const OrderPage = () => {
    const [method, setMethod] = useState(""); // Upload or Manual
    const [prescription, setPrescription] = useState<File | null>(null);
    const [patientDetails, setPatientDetails] = useState<any>(null);
    const [clinicalDetails, setClinicalDetails] = useState<any>(null);
    const [medicineList, setMedicineList] = useState<any[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState<number>(0);
    const [availableMedicines, setAvailableMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [billTotal, setBillTotal] = useState(0);
    const [medicine, setMedicine] = useState<Medicine[]>([]);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [drugInteractions, setDrugInteractions] = useState("");
    const [openInteractionModal, setOpenInteractionModal] = useState(false);

    const handleMethodSelection = (selected: string) => {
        setMethod(selected);
        setMedicineList([]);
        setPatientDetails(null);
        setClinicalDetails(null);
        setPrescription(null);
        setBillTotal(0);
    };

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
            const { data } = await axios.get('http://localhost:3001/api/medicines/all');
            setMedicine(data);
            } catch (error) {
            console.error("Error fetching medicines:", error);
            }
        };
        fetchMedicines();
    }, []);


    const handleMedicineChange = (e) => {
        const selectedMedName = e.target.value;
        setSelectedMedicine(selectedMedName);
    
        // Find the selected medicine's price
        const selectedMed = medicine.find((med) => med.name === selectedMedName);
        if (selectedMed) {
          setPricePerUnit(selectedMed.price_inr); // Set price per unit
          setPrice(selectedMed.price_inr * quantity); // Total price calculation
        } else {
          setPrice(0);
        }
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10) || 1;
        setQuantity(newQuantity);
    
        // Find selected medicine price and update total
        const selectedMed = medicine.find((med) => med.name === selectedMedicine);
        if (selectedMed) {
          setPrice(selectedMed.price_inr * newQuantity); // Total price calculation
        }
    };

  const handlePrescriptionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPrescription(file);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post("http://127.0.0.1:3002/upload", formData);
      
      setPatientDetails(data.patientDetails);
      setClinicalDetails(data.clinicalDetails);
      //setMedicineList(data.medicines);

      let totalBill = 0;
      const availableMedicines = [];
      const unavailableMedicines = [];

      for (const medicine of data.medicines) {
        const { data }= await axios.get(`http://localhost:3001/api/medicines/check-availability`, {
          params: { name: medicine, quantity: 1 } 
        });

        // alert(data.price);
        if (data.available === "medicine found" && data.price !== null) {
          availableMedicines.push({ name: medicine, quantity: 1, price: data.price });
          totalBill += data.price;
        } else {
          unavailableMedicines.push(medicine);
        }
      }

      setMedicineList(availableMedicines);
      setBillTotal(totalBill); 
      if (unavailableMedicines.length > 0) {
        alert(`Out of stock: ${unavailableMedicines.join(", ")}`);
      }
      // alert(data["clinicalDetails"]["Type"]) 
      // alert(data.message);
    } catch (error) {
      console.error("Error uploading prescription", error);
    }
    setLoading(false);
  };

  const handleMedicineSelection = async () => {
    if (!selectedMedicine) return;

    try {
        const { data } = await axios.get(`http://localhost:3001/api/medicines/check-availability`, {
            params: { name: selectedMedicine, quantity }
          });
        if (data.available) {
            const newMedicine = { name: selectedMedicine, quantity, price };
            setMedicineList([...medicineList, newMedicine]);
            setAvailableMedicines([...availableMedicines, selectedMedicine]);
            setBillTotal(prev => prev + quantity * price);
        } else {
            alert("Medicine is out of stock!");
        }
        } catch (error) {
        console.error("Error checking availability", error);
        }
  };

  const handleOrderSubmission = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:3001/api/medicines/place-order", {
        medicines: medicineList,
        patientDetails,
        clinicalDetails,
        total: billTotal
      });
      
      alert(`Order successfully placed! Order ID: ${data.orderId}`);
      setMedicineList([]);
      setPatientDetails(null);
      setClinicalDetails(null);
      setPrescription(null);
      setMethod("");
      setBillTotal(0);
    } catch (error) {
      console.error("Error placing order", error);
    }
    setLoading(false);
  };

  const handleDrugInteraction = async () => {
    setLoading(true);
    try {
      setOpenInteractionModal(true);
      const { data } = await axios.post("http://127.0.0.1:3002/check-drug-interactions", medicineList)
      setDrugInteractions(data.response);
    } catch(error) {
      console.error("Error checking drug interaction", error);
    }
    setLoading(false);
  }

  const handleAddToInvoice = (text) => {
    console.log("Added to Invoice:", text);
    setOpenInteractionModal(false);
  };


  const handlePrintBill = () => {
    window.print();
  };

  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex flex-col w-full">
        {/* Background Image Header */}
        <div className="relative w-full h-32">
          <Image src={background} alt="Pharma Bridge" layout="fill" objectFit="cover" />
          <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">
            ORDERS
          </h1>
        </div>

        {/* Step 1: Pharmacist Selects Method */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow mx-6 flex flex-row justify-between items-center">
          <h2 className="text-lg font-semibold">Choose Order Method: </h2>
          <div className="flex gap-4">
            <button onClick={() => handleMethodSelection("upload")} className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-indigo-900">
              Upload Prescription
            </button>
            <button onClick={() => handleMethodSelection("manual")} className="border border-indigo-700 text-indigo-900 hover:bg-violet-600 hover:text-white px-4 py-2 rounded">
              Manual Selection
            </button>
          </div>
        </div>

        {/* Step 2: Upload Prescription Flow */}
        {method === "upload" && (
          <>
            <div className="mt-6 mx-6 bg-violet-50 p-6 rounded-lg shadow flex flex-row justify-between items-center">
              <h2 className="text-lg font-semibold">Upload Prescription</h2>
              <input type="file" accept="image/*,application/pdf" onChange={handlePrescriptionUpload} className="w-1/3 border p-2 rounded" />
            </div>

            {prescription && (
              <div className="mt-6 mx-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-2">Extracted Information</h2>
                {loading ? <p>Loading...</p> : (
                  <>
                    <h3 className="text-lg font-semibold my-4 text-indigo-900">Patient Details</h3>
                    {patientDetails && (
                      <table className="w-full border border-gray-300">
                        <tbody>
                          <tr>
                            <td className="p-2 border-r border-b border-slate-300"><strong>Patient Name:</strong> {patientDetails["Patient Name"]}</td>
                            <td className="p-2 border-r border-b border-slate-300"><strong>Age:</strong> {patientDetails["Age"]}</td>
                            <td className="p-2 border-b border-slate-300"><strong>Gender:</strong> {patientDetails["Gender"]}</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-slate-300" colSpan={2}><strong>Diagnosis:</strong>{patientDetails["Diagnosis"] ? patientDetails["Diagnosis"]: " N/A"}</td>
                            <td className="p-2"><strong>Comments:</strong> {patientDetails["Comments"]}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                    <div className="w-full h-1 bg-violet-100"></div>
                    <h3 className="text-lg font-semibold my-4 text-indigo-900">Clinical Details</h3>
                      {clinicalDetails && (
                          <>
                          <table className="w-full border border-gray-300">
                            <tbody>
                              <tr>
                                <td className="p-2 border-r border-b border-slate-300"><strong>Department:</strong> {clinicalDetails["Clinic Name"]}</td>
                                <td className="p-2 border-r border-b border-slate-300"><strong>Doctor Name:</strong> {clinicalDetails["Doctor Name"]}</td>
                                <td className="p-2 border-b border-slate-300"><strong>Contact:</strong> {clinicalDetails["Contact"]}</td>
                              </tr>
                              <tr>
                                <td className="p-2 border-r border-slate-300"><strong>Qualification:</strong>{clinicalDetails["Qualification"] ? clinicalDetails["Qualification"]: " N/A"}</td>
                                <td className="p-2 border-r border-slate-300"><strong>Address:</strong>{clinicalDetails["Address"] ? clinicalDetails["Address"]: " N/A"}</td>
                                <td className="p-2"><strong>Timings:</strong> {clinicalDetails["Timings"]}</td>
                              </tr>
                            </tbody>
                          </table>
                          </>
                        )}
                        <div className="w-full h-1 bg-violet-100"></div>
                        <h3 className="text-lg font-semibold my-4 text-indigo-900">Prescribed Medicines</h3>
                            {medicineList &&
                              <table className="w-full border border-gray-300">
                              <thead>
                                <tr className="bg-violet-100 text-indigo-900">
                                  <th className="p-2 border-r border-slate-300 font-normal">Medicine</th>
                                  <th className="p-2  border-r border-slate-300 font-normal">Quantity</th>
                                  <th className="p-2 font-normal">Price (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {medicineList.map((med, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-2 border-r border-slate-300">{med.name}</td>
                                    <td className="text-center p-2 border-r border-slate-300">{med.quantity}</td>
                                    <td className="text-right p-2">{med.price}</td>
                                  </tr>
                                ))}
                              </tbody>
                              </table>
                          }
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 3: Medicine Selection */}
        <div className="mt-6 mx-6 bg-violet-50 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Select Medicines</h2>
          <div className="flex flex-row my-4 justify-between items-center">
            <div className="flex flex-col gap-2"> 
              <label className="w-full">Medicine:</label>
              <select value={selectedMedicine} onChange={handleMedicineChange} className="w-[400px] border p-2 rounded">
                <option value="">Select a medicine</option>
                {medicine && medicine.map((med, index) => (
                  <option key={index} value={med.name}>{med.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2"> 
              <label className="w-full">Quantity:</label>
              <input type="number" min="1" value={quantity} onChange={handleQuantityChange} className="w-[250px] border p-2 rounded" placeholder="Quantity" />
            </div>
            <div className="flex flex-col gap-2"> 
              <label className="w-full">Per Unit Price</label>
              <input type="number" min="0" value={pricePerUnit} className="w-[150px] border p-2 rounded" placeholder="Quantity" />
            </div>
            <div className="flex flex-col gap-2"> 
              <label className="w-full">Total Price:</label>
              <input type="number" min="0" value={price} readOnly className="w-[200px] border p-2 ounded" placeholder="Total Price" />
            </div>
          </div>
          <button onClick={handleMedicineSelection} className="bg-indigo-900  hover:bg-violet-600 text-white p-2 rounded mt-2 w-full">Add Medicine</button>
        </div>

        {/* Step 4: Bill & Order Submission */}
        <div className="my-6 mx-6 bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>
            <div> 
              <button onClick={handlePrintBill} className="text-indigo-900 p-2 hover:text-violet-600"><Printer /></button>
              <button onClick={handleOrderSubmission} className="text-indigo-900 p-2 hover:text-violet-600"><Mail /></button>
            </div>
          </div>
          
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-indigo-900 text-white">
                <th className="p-2 border-r border-white font-normal">Medicine</th>
                <th className="p-2  border-r border-white font-normal">Quantity</th>
                <th className="p-2 font-normal">Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {medicineList.map((med, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 border-r border-slate-300">{med.name}</td>
                  <td className="text-center p-2 border-r border-slate-300">{med.quantity}</td>
                  <td className="text-right p-2">{med.price}</td>
                </tr>
              ))}
            </tbody>
            {medicineList.length > 0 && (
              <tfoot>
              <tr className="bg-slate-600 text-white text-lg">
                <th className="text-left p-2  font-normal">Total</th>
                <th className="p-2  font-normal"></th>
                <th className="p-2 font-semibold text-right">₹ {billTotal}</th>
              </tr>
              </tfoot>
            )}
            
          </table>
          <div className="flex flex-row justify-between space-x-2">
            <button onClick={handleDrugInteraction} className="bg-violet-600 text-white p-2 rounded mt-4 w-1/4">Check for Drug Interaction</button>
            <button onClick={handleOrderSubmission} className="bg-green-500 text-white p-2 rounded mt-4 w-3/4">Place Order</button>
          </div>
          {openInteractionModal && 
            <InteractionModal 
              response={drugInteractions}
              medicines={medicineList}
              onClose={() => setOpenInteractionModal(false)}
              onAddToInvoice={handleAddToInvoice}
              loading={loading}/>
            }
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
