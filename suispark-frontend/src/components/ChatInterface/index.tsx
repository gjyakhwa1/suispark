import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, CircleCheck, CircleX } from "lucide-react";
import axios from "axios";
import ResultModal from "../ResultModal";

interface RoomDetails {
  active: boolean;
  funded: boolean;
  id: string;
  proposal: {
    abstract: string;
    teamDetails: string;
  };
  messages: { source: string; text: string }[];
}

const agents = [
  {
    name: "Byte",
    image: "cto.png",
  },
  {
    name: "Suian",
    image: "sui.png",
  },
  {
    name: "Jonah",
    image: "shark.png",
  },
];

export const ChatInterface = ({ activeRoom }: { activeRoom: string }) => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [message, setMessage] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [displayModal, setDisplayModal] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getRoomDetails = async () => {
    const response = await axios.get(`/agent/getRoomDetails/${activeRoom}`);
    setRoomDetails({
      ...response.data.roomDetails,
      messages: response.data.messages,
    });
    setSelectedAgent(response.data.messages[1].source);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomDetails((prevDetails) => ({
      ...prevDetails!,
      messages: [...prevDetails!.messages, { source: "user", text: message }],
    }));
    setMessage("");
    setIsThinking(true);
    const response = await axios.post("/agent/chat", {
      message,
      roomId: activeRoom,
    });
    if (response.data.agent) {
      setRoomDetails((prevDetails) => ({
        ...prevDetails!,
        messages: [
          ...prevDetails!.messages,
          { source: response.data.agent, text: response.data.message },
        ],
      }));
    }

    setSelectedAgent(response.data.agent);

    localStorage.setItem(
      "roundFinished",
      response.data.roundFinished ? "1" : "0"
    );
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as React.FormEvent);
    }
  };

  const handleDisplayResult = () => {
    setDisplayModal(true);
  };

  useEffect(() => {
    getRoomDetails();
  }, [activeRoom, displayModal]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomDetails?.messages]);

  return (
    <>
      {displayModal && (
        <ResultModal setDisplayModal={setDisplayModal} roomId={activeRoom} />
      )}
      <div className="flex flex-col h-[98%] w-[98%] sm:w-[80%] m-auto rounded-lg my-[10px] overflow-hidden">
        <div className="flex flex-row gap-16 justify-center items-center">
          {agents.map((agent) => (
            <div
              className="flex flex-col justify-center items-center"
              key={agent.name}
            >
              <div>
                <img
                  src={agent.image}
                  alt="Agent Image"
                  className={`${
                    selectedAgent === agent.name
                      ? "w-14 h-14 border-4 border-green-500 "
                      : "w-8 h-8"
                  } object-cover rounded-full`}
                />
              </div>
              <div>{agent.name}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {roomDetails &&
            roomDetails.messages.map(
              (msg: { source: string; text: string }, index) => (
                <div
                  key={index}
                  className={`flex flex-row gap-2 items-center w-full ${
                    msg.source === "user"
                      ? "justify-end flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  <div>
                    <img
                      src={
                        msg.source !== "user"
                          ? agents.filter(
                              (agent) => agent.name === msg.source
                            )[0].image
                          : "shark.png"
                      }
                      alt="Agent Image"
                      className="w-8 h-8 object-cover rounded-full"
                    />
                  </div>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 bg-[#f3f3f3] text-gray-900 ${
                      msg.source === "user" ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            )}

          {isThinking && (
            <div className="flex items-center gap-2">
              <img
                src={
                  agents.find((a) => a.name === selectedAgent)?.image ||
                  "shark.png"
                }
                className="w-8 h-8 rounded-full"
                alt="Agent"
              />
              <div className="p-3 bg-gray-200 text-gray-600 rounded-lg">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {roomDetails && roomDetails.active ? (
          !Boolean(Number(localStorage.getItem("roundFinished"))) ? (
            <form
              onSubmit={handleSend}
              className="p-2 border-gray-300 bg-white"
            >
              <div className="flex items-center w-full p-2 border border-gray-100 bg-white rounded-2xl shadow-md">
                <textarea
                  disabled={isThinking}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message Agent"
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent p-2 outline-none text-gray-800 resize-none max-h-[100px] overflow-y-auto"
                  rows={3}
                />
                <button
                  type="submit"
                  className="bg-black text-white rounded-full p-2 hover:bg-gray-800 flex items-center justify-center"
                >
                  <ArrowUp size={20} />
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-row justify-center items-center gap-2 border border-gray-100 bg-white shadow-md p-2 my-2 rounded-2xl">
              <div className="font-semibold text-lg">
                Agents are ready to make their decisions.
              </div>
              <div
                className="hover:cursor-pointer hover:bg-gray-800 border border-black p-2 rounded-lg bg-black text-white"
                onClick={handleDisplayResult}
              >
                View Result
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center my-2 justify-center font-semibold text-lg hover:cursor-not-allowed w-full text-center rounded-2xl p-2 border border-gray-100 bg-white shadow-md">
            Room is closed. The proposal is{" "}
            {roomDetails && roomDetails.funded ? (
              <>
                funded &nbsp; <CircleCheck className="inline text-green-500" />
              </>
            ) : (
              <>
                not funded &nbsp; <CircleX className="inline text-red-500" />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
