import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatInterface } from '../components/ChatInterface';
import { NewRoomModal } from '../components/NewRoomModal';
import { useRoomStore } from '../store/roomStore';

export const Chat: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const currentRoom = useRoomStore((state) => state.currentRoom);

  return (
    <div className="h-screen flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        onNewRoom={() => setModalOpen(true)}
      />
      
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {currentRoom ? (
          <ChatInterface />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a room or create a new one to start chatting
          </div>
        )}
      </main>

      <NewRoomModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};