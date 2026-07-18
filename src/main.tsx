import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ConvexClientProvider } from "./providers/ConvexClientProvider.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ConvexClientProvider>
    <App />
  </ConvexClientProvider>,
);
