"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from 'next/image';
import background from '../../public/background.png';
import Sidebar from "@/components/common/Sidebar";

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

const InventoryTable = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const itemsPerPage = 10;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/medicines/categories');
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Main fetch function that handles search, category filter and pagination
  const fetchMedicines = async (page: number) => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/medicines', {
        params: {
          page,
          limit: itemsPerPage,
          search: searchQuery,
          category: selectedCategory
        }
      });
      
      setMedicines(data.medicines);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    //   setTotalItems(data.totalItems);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  // Fetch medicines when page, search query or category changes
  useEffect(() => {
    fetchMedicines(currentPage);
  }, [currentPage, searchQuery, selectedCategory]);

  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
      fetchMedicines(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to first page when category changes
  };

  return (
    <div className="flex flex-row w-screen">
        <Sidebar />
        <div className="flex flex-col">
            <div className="relative w-[1160px] h-[128px]">
                <Image
                    src={background}
                    alt="Pharma Bridge"
                    layout="fill" 
                    objectFit="cover"
                />
                <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">
                    INVENTORY
                </h1>
            </div>
            {/* table */}
            <div className="p-4">
                <div className="flex gap-4 mb-4">
                    <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="p-2 border border-violet-200 rounded flex-1 text-indigo-900"
                    />
                    <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="p-2 border border-violet-200 rounded w-48 text-indigo-900"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                            {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* <div className="mb-2 text-sm text-gray-600">
                    Showing {medicines.length} of {totalItems} items
                </div> */}

                <table className="w-full border-collapse border">
                    <thead>
                    <tr className="bg-indigo-900 text-white">
                        <th className="border p-2 font-semibold w-20">Name</th>
                        <th className="border p-2 font-semibold">Category</th>
                        <th className="border p-2 font-semibold">Form</th>
                        <th className="border p-2 font-semibold">Strength</th>
                        <th className="border p-2 font-semibold">Price (INR)</th>
                        <th className="border p-2 font-semibold">Company</th>
                        <th className="border p-2 font-semibold">Indication</th>
                        <th className="border p-2 font-semibold">Classification</th>
                        <th className="border p-2 font-semibold">Stock</th>
                    </tr>
                    </thead>
                    <tbody>
                    {medicines.map((medicine, index) => (
                        <tr key={index} className="text-center hover:bg-violet-50">
                            <td className="border px-4 font-normal py-2">{medicine.name}</td>
                            <td className="border px-4 font-normal py-2">{medicine.category}</td>
                            <td className="border px-4 font-normal py-2">{medicine.dosage_form}</td>
                            <td className="border px-4 font-normal py-2">{medicine.strength}</td>
                            <td className="border px-4 font-normal py-2">{medicine.price_inr}</td>
                            <td className="border px-4 font-normal py-2">{medicine.manufacturing_company}</td>
                            <td className="border px-4 font-normal py-2">{medicine.indication}</td>
                            <td className="border px-4 font-normal py-2">{medicine.classification}</td>
                            <td className="border px-4 font-normal py-2">{medicine.quantity_in_stock}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="mt-4 flex justify-center items-center space-x-4">
                    <button
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                    Previous
                    </button>
                    <span className="text-sm">
                    Page {currentPage} of {totalPages}
                    </span>
                    <button
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                    Next
                    </button>
                </div>
            </div>
        </div>
    </div>
    
  );
};

export default InventoryTable;