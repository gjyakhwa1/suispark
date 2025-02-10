import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  extractProjectObjectId,
  getBalance,
  getTransactionDetails,
  paySuiForSubmit,
} from "./services";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useLogin } from "../../context/UserContext";
interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  getRooms: () => void;
  setLoading: (loading: boolean) => void;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({
  isOpen,
  onClose,
  getRooms,
  setLoading,
}) => {
  const [formData, setFormData] = useState({
    abstract: "",
    teamDetails: "",
  });
  const flow = useEnokiFlow();
  const { userDetails } = useLogin();
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const walletAddress = localStorage.getItem("walletAddress");

    try {
      onClose();
      setLoading(true);
      const userBalance = await getBalance(userDetails.address);
      console.log("user balance", userBalance);
      const txnResult = await paySuiForSubmit(formData.abstract, 0.001, flow);
      console.log("Contract transaction result:", txnResult);
      const txnDigest = txnResult.digest;
      const details = await getTransactionDetails(txnDigest);
      console.log("Transaction details:", details);

      const projectId = await extractProjectObjectId(details);
      console.log("Extracted Project Object ID:", projectId);
      const newRoom = {
        walletAddress,
        ...formData,
        projectId,
      };
      let response = await axios.post("/user/createRoom", newRoom);
      if (response.status == 200) {
        const chatMessage = {
          roomId: response.data.room.id,
          firstMessage: "true",
        };
        response = await axios.post("/agent/chat", chatMessage);
        console.log(response);
      }
      setLoading(false);
      setFormData({
        abstract: "",
        teamDetails: "",
      });
      localStorage.setItem("roundFinished", "0");
      await getRooms();
    } catch (e: any) {
      setLoading(false);
      setFormData({
        abstract: "",
        teamDetails: "",
      });
      toast.error(e.response.data.error);
      console.log(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Submit your idea</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Abstract
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              rows={10}
              value={formData.abstract}
              onChange={(e) =>
                setFormData({ ...formData, abstract: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Team Details
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              rows={4}
              value={formData.teamDetails}
              onChange={(e) =>
                setFormData({ ...formData, teamDetails: e.target.value })
              }
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
