"use client";
import React from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { usePathname } from 'next/navigation';
import Image from 'next/image'
import logo from '../../public/logos/png/logo-no-background.png'
import Link from 'next/link';
import avatar from '../../public/avatar.png';
import { Button } from '../ui/button';
import { LayoutDashboard, PackageOpen, ReceiptText, Settings, UserRound } from 'lucide-react';

const navbarItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Inventory', href: '/inventory', icon: PackageOpen },
    { title: 'Orders', href: '/orders', icon: ReceiptText },
    { title: 'Patients', href: '/patients/dashboard', icon: UserRound },
    { title: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar = () => {
    const route = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen w-72 bg-gradient-to-br from-indigo-100 to-indigo-50 text-white py-4">
            <div className="flex flex-col items-center justify-between h-full"> 
                <div className="flex flex-col items-center">
                    <Image src={logo} alt="Pharma Bridge Logo" width={200} height={100} />
                    <div className='w-64 h-[1px] bg-violet-900 mt-6 mb-8'></div>
                    <div className="flex flex-col items-start space-y-4">
                        {navbarItems.map((item, index) => (
                            <Link key={index} href={item.href}>
                                <div className={`flex flex-row items-center justify-center font-medium text-lg ${route === item.href ? 'text-violet-500' : 'text-indigo-900'}`}>
                                    <item.icon className="mr-2" /> {item.title}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-left pb-8 px-4">
                    <div className="flex flex-row items-center">
                        <Image src={avatar} alt="avatar" width={60} height={60} />
                        <div className='flex flex-col ml-2'>
                            <span className="text-xs text-indigo-900 font-semibold">{user?.username}</span>
                            <span className="text-xs text-indigo-900 font-semibold">{user?.email}</span>
                        </div>
                    </div>
                    <div className='w-64 h-[1px] bg-violet-900 my-6'></div>
                    <Button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-500 transition duration-300">
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar