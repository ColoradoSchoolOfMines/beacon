/**
 * @file App entrypoint
 * @see App.tsx (You probably want to use App.tsx instead of this file)
 */

import App from "~/App";
import React from "react";
import {createRoot} from "react-dom/client";

// Setup React
const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
