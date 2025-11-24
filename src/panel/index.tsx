import React from "react";
import { createRoot } from "react-dom/client";
import Panel from "./Panel";
import "./Panel.css"; // Tailwind styles

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Panel />
  </React.StrictMode>
);
