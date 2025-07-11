import { Switch, Route, useLocation } from "wouter";
import React, { Suspense, lazy } from "react";
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
import AdminAgricultura from "./pages/AdminAgricultura";
import AdminPesca from "./pages/AdminPesca";
import AdminPAA from "./pages/AdminPAA";
import AdminLogin from "./pages/AdminLogin";
import AdminLoginAgricultura from "./pages/AdminLoginAgricultura";
import AdminLoginPesca from "./pages/AdminLoginPesca";
import AdminLoginPAA from "./pages/AdminLoginPAA";
import AcessoNegado from "./pages/AcessoNegado";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import { auth } from "./utils/firebase";
import FishingInfo from "@/pages/FishingInfo";
import AgricultureInfo from "./pages/AgricultureInfo";
import BackgroundVideo from "./components/ui/BackgroundVideo";
//import MediaGallery from "@/pages/MediaGallery"; // Removed import
import GoogleDriveTest from "@/components/debug/GoogleDriveTest";

// Formulários Setoriais - Importação lazy para melhor performance
const FormAgricultura = lazy(() => import("./forms/agriculture/index"));
const FormAgriculturaCompleto = lazy(
  () => import("./forms/agricultura-completo/index"),
);
const FormPesca = lazy(() => import("./forms/pesca/index"));
const FormPescaCompleto = lazy(() => import("./forms/pesca-completo/index"));
const FormPAA = lazy(() => import("./forms/paa/index"));

function Router() {
  // Verifica se a rota atual é um formulário ou página administrativa
  const [location] = useLocation();
  const isFormPage = location.startsWith("/forms/");
  const isReportPage = location === "/report";
  const isAdminPage = location.startsWith("/admin") || location.startsWith("/login/admin");

  return (
    <>
      <BackgroundVideo videoPath="/videos/BackgroundVideo.mp4" opacity={0.3} />
      <div className="relative z-10">
        {!isFormPage && !isReportPage && !isAdminPage && <NavBar />}
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              Carregando...
            </div>
          }
        >
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/agriculture" component={Agriculture} />
            <Route path="/agriculture/info" component={AgricultureInfo} />
            <Route path="/agriculture/map" component={AgriculturaMap} />
            <Route path="/fishing" component={Fishing} />
            <Route path="/fishing/info" component={FishingInfo} />
            <Route path="/fishing/map" component={PescaMap} />
            <Route path="/paa" component={PAAInfo} />
            <Route path="/paa/map" component={PAAMap} />
            <Route path="/dashboard/:section?" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/login/admin" component={AdminLogin} />
            <Route path="/login/admin/agricultura" component={AdminLoginAgricultura} />
            <Route path="/login/admin/pesca" component={AdminLoginPesca} />
            <Route path="/login/admin/paa" component={AdminLoginPAA} />
            <Route path="/acesso-negado" component={AcessoNegado} />
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
            <Route path="/admin/agricultura">
              {() => {
                const user = auth.currentUser;
                if (!user) {
                  window.location.href = "/login/admin/agricultura";
                  return null;
                }
                return <AdminAgricultura />;
              }}
            </Route>
            <Route path="/admin/pesca">
              {() => {
                const user = auth.currentUser;
                if (!user) {
                  window.location.href = "/login/admin/pesca";
                  return null;
                }
                return <AdminPesca />;
              }}
            </Route>
            <Route path="/admin/paa">
              {() => {
                const user = auth.currentUser;
                if (!user) {
                  window.location.href = "/login/admin/paa";
                  return null;
                }
                return <AdminPAA />;
              }}
            </Route>
            {/* Panel management is integrated into dashboard */}
            <Route path="/report" component={Report} />
            <Route path="/forms/agricultura" component={FormAgricultura} />
            <Route path="/forms/pesca" component={FormPesca} />
            <Route path="/forms/paa" component={FormPAA} />
            <Route
              path="/forms/agricultura-completo"
              component={FormAgriculturaCompleto}
            />
            <Route path="/forms/pesca-completo" component={FormPescaCompleto} />
            {/* <Route path="/media-gallery" component={MediaGallery} />  Removed Route */}
            <Route path="/test-drive" component={GoogleDriveTest} />
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