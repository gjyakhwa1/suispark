import React from "react";
import { Menu, Plus, LogOut } from "lucide-react";
import { useLogin } from "../../context/UserContext";
import IRoom from "../../types/room.interface";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewRoom: () => void;
  rooms: IRoom[];
  setActiveRoom: (activeRoom: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewRoom,
  rooms,
  setActiveRoom,
}) => {
  const { logOut } = useLogin();

  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 p-2  text-black rounded hover:bg-gray-100 z-30"
        >
          <Menu size={20} />
        </button>
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 ${
          isOpen ? "w-64" : "w-0 overflow-hidden"
        } z-20`}
      >
        {isOpen && (
          <>
            <div className="flex items-center justify-between p-4">
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-800 rounded"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={onNewRoom}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                <Plus size={16} />
                <span>New Room</span>
              </button>
            </div>

            <nav className="mt-4 overflow-y-auto h-[calc(100vh-100px)]">
              {rooms.map((room: IRoom) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`w-full text-left p-4 hover:bg-gray-800 flex items-center space-x-2 `}
                >
                  <div className="truncate flex-1">{room.id}</div>
                </button>
              ))}
            </nav>

            <button
              onClick={logOut}
              className="absolute bottom-4 left-0 w-full p-4 hover:bg-gray-800 flex items-center justify-center space-x-2"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};
