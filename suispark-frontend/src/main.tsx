import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { EnokiFlowProvider } from "@mysten/enoki/react";

const ENOKI_API_KEY = import.meta.env.VITE_APP_ENOKI_PUBLIC_KEY;

createRoot(document.getElementById("root")!).render(
  <EnokiFlowProvider apiKey={ENOKI_API_KEY}>
    <UserProvider>
      <App />
    </UserProvider>
  </EnokiFlowProvider>
);
