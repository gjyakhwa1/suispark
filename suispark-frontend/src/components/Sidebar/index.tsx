import React from "react";
import { Menu, LogOut, SquarePen } from "lucide-react";
import { useLogin } from "../../context/UserContext";
import IRoom from "../../types/room.interface";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewRoom: () => void;
  rooms: IRoom[];
  setActiveRoom: (activeRoom: string) => void;
  activeRoom: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewRoom,
  rooms,
  activeRoom,
  setActiveRoom,
}) => {
  const { logOut } = useLogin();
  console.log(activeRoom);
  return (
    <>
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-30 flex items-center p-2 rounded-lg hover:bg-gray-200"
        >
          <Menu size={20} className="text-[#5d5d5d]"/>
        </button>
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-[#f9f9f9] text-white transition-all duration-300 ${
          isOpen ? "w-64" : "w-0 overflow-hidden"
        } z-20`}
      >
        {isOpen && (
          <>
            <div className="flex items-center justify-between p-4">
              <button
                onClick={onToggle}
                className="flex items-center p-2 rounded-lg hover:bg-gray-200"
              >
                <Menu size={20} className="text-[#5d5d5d]" />
              </button>
              <div className="relative group">
                <button
                  onClick={onNewRoom}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200"
                >
                  <SquarePen size={20} className="text-[#5d5d5d]" />
                </button>
                <span className="absolute z-50 top-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 transition-opacity group-hover:opacity-100">
                  Submit Your Idea
                </span>
              </div>
            </div>

            <nav className="mt-4 overflow-y-auto h-[calc(100vh-100px)]">
              {rooms.map((room: IRoom) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={"w-full text-left flex items-center"}
                >
                  <div
                    className={`truncate flex-1 text-black hover:bg-gray-200 p-2 mx-2 rounded-lg ${
                      activeRoom && activeRoom === room.id ? "bg-gray-300" : ""
                    }`}
                  >
                    {room.id}
                  </div>
                </button>
              ))}
            </nav>
            <div>
              <button
                onClick={logOut}
                className="absolute bottom-4 left-0  w-[calc(100%-16px)] mx-2 p-2 hover:bg-gray-200 flex items-center gap-2 rounded-lg text-black"
              >
                <LogOut size={20} className="text-[#5d5d5d]" />
                <span>Logout</span>
              </button>
            </div>
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
