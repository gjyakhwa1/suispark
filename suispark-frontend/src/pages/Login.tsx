import React from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const navigate = useNavigate();

  const handleZkLogin = async () => {
    try {
      // Implement Sui zkLogin logic here
      // For now, we'll just simulate a successful login
      setAuthenticated(true, 'dummy-wallet-address');
      navigate('/'); 
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to SuiSpark
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in securely with your SUI wallet
          </p>
        </div>
        <button
          onClick={handleZkLogin}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <LogIn className="h-5 w-5" />
          Connect your SUI Wallet
        </button>
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};