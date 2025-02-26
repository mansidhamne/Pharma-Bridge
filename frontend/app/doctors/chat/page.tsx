import ChatInterface from '@/components/ChatInterface'
import DoctorSidebar from '@/components/common/DoctorSidebar'
import React from 'react'
import Image from 'next/image'
import green_background from "../../../public/green-background.png"

const ChatInterfacePage = () => {
  return (
    <div className="w-full flex flex-row">
        <DoctorSidebar />
        <div className="relative w-full h-32 mb-6">
          <Image src={green_background} alt="Pharma Bridge" layout="fill" objectFit="cover" />
          <h1 className="absolute inset-0 flex items-center px-10 text-white text-3xl font-semibold">
            HELPER BOT
          </h1>
          <ChatInterface />
        </div>
       
    
    </div>
  )
}

export default ChatInterfacePage