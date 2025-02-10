import axios from "axios";
import { X, CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";

interface ResultModalProps {
  setDisplayModal: (state: boolean) => void;
  roomId: string;
}

const ResultModal: React.FC<ResultModalProps> = ({
  setDisplayModal,
  roomId,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<boolean | undefined>(undefined);

  const generateResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/agent/getDecision/${roomId}`);
      setResult(response.data.decision);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    generateResult();
  }, []);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-[380px]  max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4 flex-row-reverse">
          <button
            onClick={() => setDisplayModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        {loading ? (
          <div className="inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700 text-lg font-semibold">
              Evaluating your proposal...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="font-semibold text-lg">
              Your proposal has {!result && "not"} been funded
            </div>
            <div>
              {typeof result === "boolean" && result ? (
                <CircleCheck size={64} className="text-green-500" />
              ) : (
                <CircleX size={64} className="text-red-500" />
              )}
            </div>
            {/* {result && (
              <div
                className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 cursor-pointer"
                onClick={handleTransferFund}
              >
                Get fund
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultModal;
