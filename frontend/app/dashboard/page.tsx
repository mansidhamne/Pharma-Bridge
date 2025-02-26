/* eslint-disable @next/next/no-img-element */
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/common/Sidebar';
import Image from 'next/image';
import background from '@/public/background.png';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-row">
      <Sidebar />

      <div className="relative w-[1160px] h-[128px]">
        <Image
          src={background}
          alt="Pharma Bridge"
          layout="fill" 
          objectFit="cover"
        />
        <h1 className="absolute inset-0 flex items-center px-10 text-white text-xl font-semibold">
          Welcome, {user?.username}!
        </h1>
      </div>
    </div>
  );
}