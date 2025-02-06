import React, { useEffect, useState } from "react";
import { useRoomStore } from "../../store/roomStore";
import { Send } from "lucide-react";
import axios from "axios";

export const ChatInterface = ({ activeRoom }: { activeRoom: string }) => {
  const [chatHistory, setHistory] = useState([]);
  const [message, setMessage] = useState<string>("");

  const getChatHistory = async () => {
    const response = await axios.get(`/agent/getChatHistory/${activeRoom}`);
    const chatHistory = response.data.messages;
    setHistory(chatHistory);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post("/agent/chat", { message, roomId: activeRoom });
    await getChatHistory();
    setMessage("");
  };

  useEffect(() => {
    getChatHistory();
  }, [activeRoom]);

  return (
    <div className="flex flex-col h-[98%] w-[98%] sm:w-[80%] m-auto border border-gray-300 rounded-lg p-2 my-[10px]">
      {activeRoom}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg: { source: string; text: string }, index) => (
          <div
            key={index}
            className={`flex ${
              msg.source === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.source === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
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
