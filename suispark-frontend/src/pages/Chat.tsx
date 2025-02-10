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
  const [loading, setLoading] = useState(false);
  const getRooms = async () => {
    const walletAddress = localStorage.getItem("walletAddress");

    const response = await axios.get(`/user/getRooms/${walletAddress}`);
    const _rooms = response.data.rooms;
    setRooms(_rooms);
    const activeRoomFromDb = _rooms.find((room: any) => room.active);

    if (activeRoomFromDb) {
      setActiveRoom(activeRoomFromDb.id);
    } else {
      if (_rooms.length > 0) {
        setActiveRoom(_rooms[0].id);
      }
    }
  };

  useEffect(() => {
    getRooms();
  }, []);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
          <p className="mt-4 text-white text-lg font-semibold">
            Evaluating your idea...
          </p>
        </div>
      )}
      <div className="h-screen flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setSidebarOpen(!isSidebarOpen)}
          onNewRoom={() => setModalOpen(true)}
          rooms={rooms}
          activeRoom={activeRoom}
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
              Create a room and submit your idea to fund your project
            </div>
          )}
        </main>
        <div className="absolute right-0 flex flex-col items-center justify-center mt-2 mr-2  bg-white shadow-md rounded-lg w-40 text-center">
          <div className="text-gray-500 text-lg font-medium">Project Fund</div>
          <div className="text-green-600 text-2xl font-bold mt-1">0.05 SUI</div>
        </div>

        <NewRoomModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          getRooms={getRooms}
          setLoading={setLoading}
        />
      </div>
    </>
  );
};
