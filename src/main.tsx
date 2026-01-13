import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LocalesProvider } from "./providers/LocalesProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalesProvider>
      <App />
    </LocalesProvider>
  </StrictMode>
);
