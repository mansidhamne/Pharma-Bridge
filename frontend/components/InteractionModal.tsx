import React from "react";

type Medicine = {
  name: string;
  quantity: number;
  price: number;
};

interface InteractionModalProps {
  response: string;
  medicines: Medicine[];
  onClose: () => void;
  onAddToInvoice: (response: string) => void;
  loading: boolean;
}

const InteractionModal: React.FC<InteractionModalProps> = ({ response, medicines, onClose, onAddToInvoice, loading }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl text-center text-indigo-900 font-bold mb-4">Drug Interaction Checker</h2>
        
        {/* Show selected medicines */}
        <p className="font-semibold text-lg text-black mb-2">Medicines Prescribed:</p>
        <ul className="list-disc ml-5 mb-5 font-medium">
          {medicines.map((med, index) => (
            <li key={index}>{med.name}</li>
          ))}
        </ul>

        {/* Show loading or response */}
        {loading ? (
          <p className="text-violet-600 font-medium">Checking interactions...</p>
        ) : (
          <p className="text-gray-700 text-justify">{response || "No interactions found."}</p>
        )}

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 border border-violet-600 hover:bg-red-500 hover:text-white hover:border-0 text-indigo-900 rounded-lg">Close</button>
          <button onClick={() => onAddToInvoice(response)} className="px-4 py-2 bg-violet-600 hover:bg-indigo-900 text-white rounded-lg">Add to Invoice</button>
        </div>
      </div>
    </div>
  );
};

export default InteractionModal;
