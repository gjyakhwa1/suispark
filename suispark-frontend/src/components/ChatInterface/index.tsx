import React, { useState } from "react";
import { useRoomStore } from "../../store/roomStore";
import { Send } from "lucide-react";

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const { currentRoom, messages, addMessage } = useRoomStore();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    addMessage({
      id: crypto.randomUUID(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      roomId: currentRoom.id,
    });
    setMessage("");
  };

  return (
    <div className="flex flex-col h-[98%] w-[98%] sm:w-[80%] m-auto border border-gray-300 rounded-lg p-2 my-[10px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .filter((msg) => msg.roomId === currentRoom?.id)
          .map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
      </div>

      <form onSubmit={handleSend} className="p-4">
        <div className="flex items-center space-x-2 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
