'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import InventoryDashboard from '@/components/InventoryDashboard';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActionTriggered = () => {
    // Increment to trigger a re-fetch in the InventoryDashboard
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">
        
        {/* Left column: Dashboard */}
        <div className="flex-1 h-full hidden md:block">
          <div className="h-full glass rounded-3xl relative overflow-hidden">
            {/* Background glowing orb */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <InventoryDashboard refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Right column: Chat */}
        <div className="w-full md:w-[450px] lg:w-[500px] h-full flex flex-col">
          <ChatInterface onActionTriggered={handleActionTriggered} />
        </div>

      </div>
    </main>
  );
}
