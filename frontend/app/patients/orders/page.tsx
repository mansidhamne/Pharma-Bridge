// "use client";
// import PatientSidebar from '@/components/common/PatientSidebar';
// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import blue_background from '../../../public/blue_background.png';
// import axios from 'axios';

// type Order = {
//     _id: string;
//     createdAt: string;
//     patientDetails: {
//         "Patient Name": string;
//         Age: number;
//         Gender: string;
//         Diagnosis: string;
//         Comments: string;
//     };
//     clinicalDetails: {
//         "Clinic Name": string;
//         "Doctor Name": string;
//         Contact: string;
//         Address: string;
//         Qualification: string;
//         Timings: string;
//     };
//     medicines: {
//         _id: string;
//         name: string;
//         quantity: number;
//     }[];
//     totalAmount: number;
// };


// const PatientOrders = () => {
//   const [orderData, setOrderData] = useState<Order[]>([]);

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const { data } = await axios.get('http://localhost:3001/api/orders'); // Update the API URL
//         alert(data);
//         setOrderData(data);
//       } catch (error) {
//         console.error('Error fetching order data:', error);
//       }
//     };
//     fetchOrder();
//   }, []);

//   if (!orderData) {
//     return <p className="text-center mt-10 text-gray-600">Loading order details...</p>;
//   }

//   return (
//     <div className="flex flex-row w-screen">
//       <PatientSidebar />
//       <div className="flex flex-col w-full">
//         {/* Header */}
//         <div className="relative w-full h-[128px] mb-6">
//           <Image src={blue_background} alt="Pharma Bridge" layout="fill" objectFit="cover" />
//           <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">
//             MEDICINE ORDERS
//           </h1>
//         </div>

//         {orderData.map((order) => (
//   <div key={order._id} className="order-card">
//     <h3>Order ID: {order._id}</h3>
    
//     {/* Patient Details (Handle missing data) */}
//     {order.patientDetails ? (
//       <>
//         <p><strong>Name:</strong> {order.patientDetails["Patient Name"]}</p>
//         <p><strong>Age:</strong> {order.patientDetails.Age}</p>
//         <p><strong>Gender:</strong> {order.patientDetails.Gender}</p>
//         <p><strong>Diagnosis:</strong> {order.patientDetails.Diagnosis}</p>
//         <p><strong>Comments:</strong> {order.patientDetails.Comments}</p>
//       </>
//     ) : (
//       <p>No patient details available</p>
//     )}

//     {/* Clinical Details (Handle missing data) */}
//     {order.clinicalDetails ? (
//       <>
//         <p><strong>Clinic Name:</strong> {order.clinicalDetails["Clinic Name"]}</p>
//         <p><strong>Doctor Name:</strong> {order.clinicalDetails["Doctor Name"]}</p>
//         <p><strong>Contact:</strong> {order.clinicalDetails.Contact}</p>
//         <p><strong>Address:</strong> {order.clinicalDetails.Address}</p>
//       </>
//     ) : (
//       <p>No clinical details available</p>
//     )}

//     {/* Medicines List */}
//     <h4>Medicines:</h4>
//     <ul>
//       {order.medicines.map((med) => (
//         <li key={med._id}>{med.name} (Quantity: {med.quantity})</li>
//       ))}
//     </ul>

//     <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
//     <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
//   </div>
// ))}

//       </div>
//     </div>
//   );
// };

// export default PatientOrders;
"use client";

import PatientSidebar from '@/components/common/PatientSidebar';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import blue_background from '../../../public/blue_background.png';
import axios from 'axios';

type Order = {
  _id: string;
  createdAt: string;
  patientDetails?: {
    "Patient Name": string;
    Age: number;
    Gender: string;
    Diagnosis: string;
    Comments: string;
  } | null;
  clinicalDetails?: {
    "Clinic Name": string;
    "Doctor Name": string;
    Contact: string;
    Address: string;
    Qualification: string;
    Timings: string;
  } | null;
  medicines: {
    _id: string;
    name: string;
    quantity: number;
  }[];
  totalAmount: number;
};

const PatientOrders = () => {
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/orders');
        console.log('Fetched Orders:', data);
        setOrderData(data);
      } catch (error) {
        console.error('Error fetching order data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-600 text-lg">Loading order details...</p>;
  }

  return (
    <div className="flex flex-row w-screen min-h-screen bg-gray-100">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="relative w-full h-32 mb-6">
          <Image src={blue_background} alt="Pharma Bridge" layout="fill" objectFit="cover" />
          <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">
            ORDER HISTORY
          </h1>
        </div>

        {/* Orders Section */}
        <div className="flex flex-col space-y-6 mx-10">
          {orderData.length > 0 ? (
            orderData.map((order) => (
              <div key={order._id} className="bg-white shadow-md rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Order ID: {order._id}</h3>
                <p className="text-sm text-gray-500">Created At: {new Date(order.createdAt).toLocaleString()}</p>

                {/* Patient Details */}
                {order.patientDetails ? (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700">Patient Details:</h4>
                    <p><strong>Name:</strong> {order.patientDetails["Patient Name"]}</p>
                    <p><strong>Age:</strong> {order.patientDetails.Age}</p>
                    <p><strong>Gender:</strong> {order.patientDetails.Gender}</p>
                    <p><strong>Diagnosis:</strong> {order.patientDetails.Diagnosis}</p>
                    <p><strong>Comments:</strong> {order.patientDetails.Comments}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No patient details available</p>
                )}

                {/* Clinical Details */}
                {order.clinicalDetails ? (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700">Clinic Details:</h4>
                    <p><strong>Clinic:</strong> {order.clinicalDetails["Clinic Name"]}</p>
                    <p><strong>Doctor:</strong> {order.clinicalDetails["Doctor Name"]}</p>
                    <p><strong>Contact:</strong> {order.clinicalDetails.Contact}</p>
                    <p><strong>Address:</strong> {order.clinicalDetails.Address}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No clinic details available</p>
                )}

                {/* Medicines List */}
                <div className="mt-3">
                  <h4 className="font-medium text-gray-700">Medicines:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {order.medicines.map((med) => (
                      <li key={med._id}>{med.name} (Qty: {med.quantity})</li>
                    ))}
                  </ul>
                </div>

                {/* Total Amount */}
                <p className="mt-4 text-gray-800 font-semibold text-lg">Total: ₹{order.totalAmount}</p>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600 text-lg">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientOrders;
