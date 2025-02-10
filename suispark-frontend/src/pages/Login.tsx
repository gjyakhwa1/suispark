import React from "react";
import { useLogin } from "../context/UserContext";
import { FcGoogle } from "react-icons/fc";
import { LoginBgImg } from "../assets/images/background-images";

export const Login: React.FC = () => {
  const { login } = useLogin();

  return (
    <div className="h-screen flex items-center justify-center relative">
      <div className="h-full w-full">
        <img
          src={LoginBgImg}
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-1/2 flex flex-col items-center gap-10 justify-center z-10">
        <img src="logo.png" className="h-[10rem] w-[8rem]" />
        <h2 className="mt-6 text-3xl font-semibold font-poppins text-primary">
          Welcome to SuiSpark
        </h2>
        <button
          className="flex items-center gap-2 bg-white shadow-md border p-4 rounded-lg hover:bg-gray-200"
          onClick={login}
        >
          <FcGoogle size={24} /> Sign in with Google
        </button>
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
        <h2 className="text-xl">Supported By</h2>
        <img src="ibriz.jpg" className="h-[6rem] w-[6rem]" />
      </div>
    </div>
  );
};
