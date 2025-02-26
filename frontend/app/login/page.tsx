// 'use client';

// import { useState } from 'react';
// import { useAuth } from '@/app/context/AuthContext';
// import Link from 'next/link';

// export default function Login() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const { login } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await login(formData.email, formData.password);
//     } catch (error: any) {
//       setError(error.response?.data?.message || 'An error occurred');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
//         <h2 className="text-3xl font-bold text-center">Log In</h2>
//         {error && (
//           <div className="bg-red-100 text-red-700 p-3 rounded">
//             {error}
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//               value={formData.email}
//               onChange={(e) => setFormData({
//                 ...formData,
//                 email: e.target.value,
//               })}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               required
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//               value={formData.password}
//               onChange={(e) => setFormData({
//                 ...formData,
//                 password: e.target.value,
//               })}
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
//           >
//             Log In
//           </button>
//         </form>
//         <div className="text-center">
//           Don&apos;t have an account?{' '}
//           <Link href="/signup" className="text-blue-600 hover:text-blue-500">
//             Sign up
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import pharmacy from "../../public/pharmacy.jpg"

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col p-8 sm:p-12 lg:p-16 justify-center max-w-[700px]">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-16">
            <Image
              src="/logos/png/logo-no-background.png"
              alt="Pharma Bridge Logo"
              width={200}
              height={80}
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">Hi there!</h1>
          <p className="text-xl text-muted-foreground">Have we met before?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@email.com"
              value={formData.email}
              onChange={(e) => setFormData({
                ...formData,
                email: e.target.value,
              })}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({
                ...formData,
                password:e.target.value,
              })}
              required
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base bg-violet-600 hover:bg-indigo-900">
            Log in
          </Button>

          <div className="relative my-8">
            <Separator className="my-4" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              OR
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <Link href="/forgot-password" className="block text-violet-600 hover:underline">
              Forgot my password
            </Link>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-violet-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-slate-50 items-center justify-center">
        <div className="relative w-full min-h-screen">
          <Image
            src={pharmacy}
            alt="Login illustration"
            fill
            // className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}

