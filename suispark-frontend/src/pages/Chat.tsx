import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatInterface } from "../components/ChatInterface";
import { NewRoomModal } from "../components/NewRoomModal";
import IRoom from "../types/room.interface";
import axios from "axios";

export const Chat: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const getRooms = async () => {
    const walletAddress = localStorage.getItem("walletAddress");

    const response = await axios.get(`/user/getRooms/${walletAddress}`);
    const _rooms = response.data.rooms;
    setRooms(_rooms);
    if (_rooms.length > 0) {
      let _activeRoom = rooms.filter((room) => room.active);
      if (_activeRoom.length > 0) {
        setActiveRoom(_activeRoom[0].id);
      } else {
        setActiveRoom(_rooms[0].id);
      }
    }
  };

  useEffect(() => {
    getRooms();
  }, []);
  return (
    <div className="h-screen flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        onNewRoom={() => setModalOpen(true)}
        rooms={rooms}
        setActiveRoom={setActiveRoom}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {activeRoom ? (
          <ChatInterface activeRoom={activeRoom} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Create a room to get your funding.
          </div>
        )}
      </main>

      <NewRoomModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        getRooms={getRooms}
      />
    </div>
  );
};
