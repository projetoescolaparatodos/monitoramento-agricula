import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import 'react-quill/dist/quill.snow.css'; // Importação prioritária do CSS do Quill
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);