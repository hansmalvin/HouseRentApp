import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import "./index.css";
import App from "./App.jsx";
import { rentEaseAntdTheme } from "./config/antdTheme.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={rentEaseAntdTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
