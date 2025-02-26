import React from 'react'
import Image from 'next/image'
import logo from '../../public/logos/png/logo-no-background.png'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
            <Image src={logo} alt="Pharma Bridge Logo" width={100} height={80} />
            {/* <span className="ml-2 text-xl font-bold text-blue-600">Pharma Bridge</span> */}
          </div>
          <div className="hidden md:flex space-x-4">
            <Link href="#features" className="text-gray-600 hover:text-indigo-800 transition duration-300">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-800 transition duration-300">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-indigo-800 transition duration-300">
              Testimonials
            </Link>
          </div>
          <Link href="/login">
            <button className="bg-indigo-800 text-white px-4 py-2 rounded-full hover:bg-violet-500 transition duration-300">
                Get Started
            </button>
          </Link>
    </div>
  )
}

export default Navbar