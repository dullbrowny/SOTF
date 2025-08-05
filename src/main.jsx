import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { DemoDataProvider } from "./demoData.jsx";
import "./styles.css";
import "./index.css";   // <-- add this line for 3 column

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoDataProvider>
        <App />
      </DemoDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);

