import { Switch, Route, useLocation } from "wouter";
import React, { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChatButton } from "@/components/chat/ChatButton";
import ChatbotWidget from "@/components/chat/ChatbotWidget";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/Home";
import Report from "@/pages/Report";
import AgriculturaMap from "@/pages/AgriculturaMap";
import PescaMap from "@/pages/PescaMap";
import PAAMap from "@/pages/PAAMap";
import Agriculture from "@/pages/Agriculture";
import Fishing from "@/pages/Fishing";
import PAAInfo from "@/pages/PAAInfo";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import { auth } from "./utils/firebase";
import FishingInfo from "@/pages/FishingInfo";
import AgricultureMap from "@/pages/AgriculturaMap";
import AgricultureInfo from "./pages/AgricultureInfo";
import BackgroundVideo from "./components/ui/BackgroundVideo";

// Formulários Setoriais - Importação lazy para melhor performance
const FormAgricultura = React.lazy(() => import('./forms/agriculture'));
const FormPesca = React.lazy(() => import('./forms/pesca'));
const FormPAA = React.lazy(() => import('./forms/paa'));));

function Router() {
  // Verifica se a rota atual é um formulário
  const [location] = useLocation();
  const isFormPage = location.startsWith('/forms/');
  const isReportPage = location === '/report';
  
  return (
    <>
      <BackgroundVideo videoPath="/videos/BackgroundVideo.mp4" opacity={0.3} />
      <div className="relative z-10">
        <ChatbotWidget />
        {!isFormPage && !isReportPage && <NavBar />}
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/agriculture" component={Agriculture} />
            <Route path="/agriculture/info" component={AgricultureInfo} />
            <Route path="/agriculture/map" component={AgricultureMap} />
            <Route path="/fishing" component={Fishing} />
            <Route path="/fishing/info" component={FishingInfo} />
            <Route path="/fishing/map" component={PescaMap} /> 
            <Route path="/paa" component={PAAInfo} /> 
            <Route path="/paa/info" component={PAAInfo} />
            <Route path="/paa/map" component={PAAMap} />
            <Route path="/dashboard/:section?" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/admin">
              {() => {
                const user = auth.currentUser;
                if (!user) {
                  window.location.href = "/login";
                  return null;
                }
                return <Admin />;
              }}
            </Route>
            <Route path="/report" component={Report} />
            <Route path="/forms/agricultura" component={FormAgricultura} />
            <Route path="/forms/pesca" component={FormPesca} />
            <Route path="/forms/paa" component={FormPAA} /> */}
            <Route path="/forms/agricultura" component={FormAgricultura} />
            <Route path="/forms/pesca" component={FormPesca} />
            <Route path="/forms/paa" component={FormPAA} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ChatbotWidget />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;