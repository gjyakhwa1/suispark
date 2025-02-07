import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Login } from "./pages/Login";
import { Chat } from "./pages/Chat";
import { useLogin } from "./context/UserContext";

import defaultConfig from "./config";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userDetails } = useLogin();
  const location = useLocation();

  useEffect(() => {
    console.log("Auth State:", { isLoggedIn, address: userDetails.address });
  }, [isLoggedIn, userDetails]);

  if (!isLoggedIn && location.pathname !== "/login") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoggedIn && location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isLoggedIn } = useLogin();
  axios.defaults.baseURL = defaultConfig["baseUrl"];
  useEffect(() => {
    console.log("App mounted, initial auth state:", isLoggedIn);
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PrivateRoute>
                <Login />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
