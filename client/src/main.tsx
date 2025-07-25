import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { browserCompatibility } from "./utils/browserCompatibility";
import ErrorBoundary from "./components/common/ErrorBoundary";
import 'react-quill/dist/quill.snow.css'; // Importação prioritária do CSS do Quill
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

// Inicializar otimizações de compatibilidade
browserCompatibility.initialize();

// Detectar modo seguro
const urlParams = new URLSearchParams(window.location.search);
const safeMode = urlParams.get('safe_mode') === '1';

if (safeMode) {
  console.log('Executando em modo seguro');
  // Desabilitar service workers em modo seguro
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);