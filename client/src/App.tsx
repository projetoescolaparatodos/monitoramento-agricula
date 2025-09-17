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
import Footer from "@/components/layout/Footer";
import { auth } from "./utils/firebase";
import FishingInfo from "@/pages/FishingInfo";
import AgricultureInfo from "./pages/AgricultureInfo";
import BackgroundVideo from "./components/ui/BackgroundVideo";
//import MediaGallery from "@/pages/MediaGallery"; // Removed import
import GoogleDriveTest from "@/components/debug/GoogleDriveTest";
import AdminPanels from "./pages/AdminPanels";
import AdminSecretario from "./pages/AdminSecretario";
import AdminDynamicStats from "@/pages/AdminDynamicStats";
import RegistrarDoacao from "@/pages/RegistrarDoacao";
import EventoTelao from "./pages/EventoTelao";
import EventosDisponiveis from "./pages/EventosDisponiveis";
import AdminLoginGestor from "./pages/AdminLoginGestor";
import AdminGaragem from "@/pages/AdminGaragem";

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
  const isFormPage = location.startsWith("/forms");
  const isReportPage = location === "/report";
  const isAdminPage =
    location.startsWith("/admin") || location === "/dashboard";
  const isMapPage =
    location.includes('/map') ||
    location.includes('Map') ||
    ['/agriculture/map', '/paa/map', '/pesca/map'].includes(location);
  const isLoginPage = location.startsWith('/login/admin');
  const isDoacaoPage = location === '/registrar-doacao';
  const isTelaoPage = location.startsWith('/evento-telao');

  function ConditionalFooter() {
    const [location] = useLocation();

    // Lista de rotas onde o Footer não deve aparecer
    const mapRoutes = ['/agricultura/map', '/pesca/map', '/paa/map'];

    // Não renderiza o Footer se a rota atual estiver na lista de mapas
    if (mapRoutes.includes(location)) {
      return null;
    }

    return <Footer />;
  }

  return (
    <>
      <BackgroundVideo videoPath="/videos/BackgroundVideo.mp4" opacity={0.3} />
      <div className="relative z-10">
        {!isFormPage &&
          !isReportPage &&
          !isAdminPage &&
          !isLoginPage &&
          !isDoacaoPage &&
          !isTelaoPage && <NavBar />}
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              Carregando...
            </div>
          }
        >
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/agricultura" component={Agriculture} />
            <Route path="/agricultura/info" component={AgricultureInfo} />
            <Route path="/agricultura/map" component={AgriculturaMap} />
            <Route path="/pesca" component={Fishing} />
            <Route path="/pesca/info" component={FishingInfo} />
            <Route path="/pesca/map" component={PescaMap} />
            <Route path="/paa" component={PAAInfo} />
            <Route path="/paa/map" component={PAAMap} />
            <Route path="/dashboard/:section?" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/admin/secretario" component={AdminSecretario} />
            <Route path="/login" component={Login} />
            <Route path="/login/admin" component={AdminLogin} />
            <Route path="/login/admin/gestor" component={AdminLoginGestor} />
            <Route
              path="/login/admin/agricultura"
              component={AdminLoginAgricultura}
            />
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
            <Route path="/admin-panels" component={AdminPanels} />
            <Route path="/admin/info-panels" component={AdminPanels} />
            <Route path="/admin/dynamic-stats" component={AdminDynamicStats} />
            <Route path="/registrar-doacao" component={RegistrarDoacao} />
            <Route path="/evento-telao" component={EventoTelao} />
            <Route path="/eventos-disponiveis" component={EventosDisponiveis} />
            <Route path="/admin/garagem" component={AdminGaragem} />
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
        {!isFormPage &&
          !isReportPage &&
          !isAdminPage &&
          !isLoginPage &&
          !isDoacaoPage &&
          !isTelaoPage && <ConditionalFooter />}
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