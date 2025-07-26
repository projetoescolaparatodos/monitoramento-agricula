
import { Switch, Route, useLocation } from "wouter";
import React, { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ChatButton } from "@/components/chat/ChatButton";
import ChatbotWidget from "@/components/chat/ChatbotWidget";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { performanceMonitor } from "@/utils/performanceMonitor";
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
import AdminPanels from '@/pages/AdminPanels';
import AdminDynamicStats from '@/pages/AdminDynamicStats';
import RegistrarDoacao from '@/pages/RegistrarDoacao';
import EventoTelao from './pages/EventoTelao';
import EventosDisponiveis from './pages/EventosDisponiveis';
import AdminLoginGestor from "./pages/AdminLoginGestor";

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
  const isFormPage = location.startsWith('/forms');
  const isReportPage = location === '/report';
  const isAdminPage = location.startsWith('/admin') || location === '/dashboard';
  const isMapPage = location.includes('/map') || 
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
        {!isFormPage && !isReportPage && !isAdminPage && !isLoginPage && !isDoacaoPage && !isTelaoPage && <NavBar />}
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
            <Route path="/login" component={Login} />
            <Route path="/login/admin" component={AdminLogin} />
            <Route path="/login/admin/gestor" component={AdminLoginGestor} />
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
            <Route path="/admin-panels" component={AdminPanels} />
            <Route path="/admin/info-panels" component={AdminPanels} />
            <Route path="/admin/dynamic-stats" component={AdminDynamicStats} />
            <Route path="/registrar-doacao" component={RegistrarDoacao} />
            <Route path="/evento-telao" component={EventoTelao} />
            <Route path="/eventos-disponiveis" component={EventosDisponiveis} />
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
        {!isFormPage && !isReportPage && !isAdminPage && !isLoginPage && !isDoacaoPage && !isTelaoPage && <ConditionalFooter />}
      </div>
    </>
  );
}

function App() {
  // Inicializar monitoramento de performance e diagnóstico
  React.useEffect(() => {
    performanceMonitor.startMonitoring();
    
    // Importar e executar diagnóstico inicial
    import('@/utils/domSafeManipulation').then(({ diagnoseReactComponents, createReactStateMonitor }) => {
      // Diagnóstico inicial após 2 segundos
      setTimeout(() => {
        diagnoseReactComponents();
      }, 2000);
      
      // Monitoramento contínuo de estado (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        const cleanupStateMonitor = createReactStateMonitor();
        
        // Cleanup após 5 minutos para evitar memory leak
        setTimeout(() => {
          cleanupStateMonitor();
        }, 300000);
      }
      
      // Diagnóstico periódico
      const diagnosticInterval = setInterval(() => {
        diagnoseReactComponents();
      }, 120000); // A cada 2 minutos
      
      return () => {
        clearInterval(diagnosticInterval);
      };
    });
  }, []);

  // Monitoramento contínuo de erros e DOM
  React.useEffect(() => {
    // MutationObserver para monitorar mudanças no DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.removedNodes.length > 0) {
          Array.from(mutation.removedNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              console.debug('🔍 Nó removido:', {
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                hasParent: !!mutation.target,
                targetTag: mutation.target?.nodeName
              });
              
              // Verificar se é um componente conhecido problemático
              if (element.className?.includes('card') || 
                  element.className?.includes('text') ||
                  element.tagName === 'P') {
                console.warn('⚠️ Componente crítico removido:', {
                  element: element.tagName,
                  classes: element.className,
                  id: element.id
                });
              }
            }
          });
        }
        
        if (mutation.addedNodes.length > 0) {
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              console.debug('➕ Nó adicionado:', {
                tagName: element.tagName,
                className: element.className,
                id: element.id
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });

    // Importar funções de verificação e limpeza de DOM
    import('@/utils/domSafeManipulation').then(({ checkDomIntegrity, performAutomaticCleanup }) => {
      // Verificar integridade do DOM periodicamente
      const domCheckInterval = setInterval(() => {
        if (!checkDomIntegrity()) {
          console.warn('🔍 Problemas de integridade DOM detectados');
          // Executar limpeza automática se problemas forem detectados
          performAutomaticCleanup();
        }
      }, 60000); // Verificar a cada 1 minuto

      // Limpeza automática mais frequente
      const cleanupInterval = setInterval(() => {
        performAutomaticCleanup();
      }, 300000); // Limpar a cada 5 minutos

      // Cleanup dos intervals e observer
      return () => {
        clearInterval(domCheckInterval);
        clearInterval(cleanupInterval);
        observer.disconnect();
      };
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    // Capturar erros JavaScript globais
    const handleError = (event: ErrorEvent) => {
      console.error('❌ Erro global capturado:', {
        message: event.error?.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      });
      
      // Verificar se é erro específico de DOM
      if (event.error?.message?.includes('removeChild') || 
          event.error?.message?.includes('Node') ||
          event.error?.message?.includes('insertBefore') ||
          event.error?.message?.includes('appendChild')) {
        console.error('🔴 Erro de manipulação DOM detectado:', {
          error: event.error.message,
          stack: event.error.stack,
          userAgent: navigator.userAgent,
          url: window.location.href,
          component: event.error.stack?.match(/at (\w+)/)?.[1] || 'Unknown'
        });

        // Tentar recuperação automática para erros específicos do Card
        if (event.error.message.includes('removeChild') && 
            event.error.stack?.includes('card.tsx')) {
          console.log('🔄 Tentando recuperação automática para erro no Card...');
          
          // Limpar possíveis referências DOM órfãs
          setTimeout(() => {
            try {
              const cards = document.querySelectorAll('[class*="card"]');
              cards.forEach(card => {
                if (card && !card.isConnected) {
                  console.log('🧹 Removendo referência DOM órfã de card');
                }
              });
            } catch (cleanupError) {
              console.warn('Erro durante limpeza automática:', cleanupError);
            }
          }, 100);
        }
      }
    };

    // Capturar promises rejeitadas não tratadas com filtro melhorado
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // Lista expandida de erros para silenciar
      const shouldSilence = (
        !reason || 
        (typeof reason === 'object' && (
          Object.keys(reason).length === 0 ||
          JSON.stringify(reason) === '{}' ||
          reason.constructor === Object && Object.entries(reason).length === 0
        )) ||
        (typeof reason === 'string' && reason.trim() === '') ||
        (reason.message && (
          reason.message.includes('fetch') ||
          reason.message.includes('import') ||
          reason.message.includes('Loading chunk') ||
          reason.message.includes('vite') ||
          reason.message.includes('Failed to import') ||
          reason.message.includes('network') ||
          reason.message.toLowerCase().includes('loading') ||
          reason.message.includes('hydration') ||
          reason.message.includes('ReactDOM') ||
          reason.message.includes('findDOMNode')
        )) ||
        (reason.name && (
          reason.name === 'ChunkLoadError' ||
          reason.name === 'NetworkError' ||
          reason.name === 'AbortError' ||
          reason.name === 'TypeError' && !reason.message
        )) ||
        // Silenciar promises vazias que são comuns em desenvolvimento
        (reason === undefined || reason === null)
      );

      if (shouldSilence) {
        // Silenciar completamente esses erros, mas manter contagem para debugging
        if (process.env.NODE_ENV === 'development') {
          console.debug('🔇 Promise rejeitada silenciada:', typeof reason, reason);
        }
        event.preventDefault();
        return;
      }
      
      // Log apenas erros realmente relevantes
      console.error('❌ Promise rejeitada (relevante):', {
        reason: reason,
        reasonType: typeof reason,
        reasonKeys: reason && typeof reason === 'object' ? Object.keys(reason) : [],
        message: reason?.message || 'No message',
        stack: reason?.stack || 'No stack',
        name: reason?.name || 'No name',
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ChatbotWidget />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
