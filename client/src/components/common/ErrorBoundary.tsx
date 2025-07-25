
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];
  
  public state: State = {
    hasError: false,
    errorId: '',
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    console.error('ErrorBoundary capturou um erro:', error);
    
    return { 
      hasError: true, 
      error,
      errorId,
      retryCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId
    };

    console.error('ErrorBoundary - Detalhes completos do erro:', errorDetails);

    // Detectar problemas específicos
    const isChromeMobileIssue = /Chrome|CriOS/i.test(navigator.userAgent) && 
      /Mobile|Android/i.test(navigator.userAgent);
    
    const isMemoryIssue = error.message.includes('out of memory') || 
      error.message.includes('Maximum call stack');
    
    const isNetworkIssue = error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('WebSocket');

    if (isChromeMobileIssue) {
      console.warn('Detectado problema específico do Chrome Mobile');
    }

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar erro para serviço de monitoramento
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_id: this.state.errorId,
          is_chrome_mobile: isChromeMobileIssue,
          is_memory_issue: isMemoryIssue,
          is_network_issue: isNetworkIssue
        }
      });
    }

    // Tentar recuperação automática para certos tipos de erro
    if (isNetworkIssue && this.state.retryCount < 2) {
      const timeout = setTimeout(() => {
        this.handleAutoRecovery();
      }, 3000);
      this.retryTimeouts.push(timeout);
    }
  }

  private handleAutoRecovery = () => {
    console.log('Tentando recuperação automática...');
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined,
      retryCount: prevState.retryCount + 1
    }));
  }

  public componentWillUnmount() {
    // Limpar timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChromeMobile = /Chrome|CriOS/i.test(navigator.userAgent) && 
        /Mobile|Android/i.test(navigator.userAgent);

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ops! Algo deu errado
            </h2>
            <p className="text-gray-600 mb-4">
              {isChromeMobile 
                ? "Detectamos um problema de compatibilidade com seu navegador Chrome mobile." 
                : "Ocorreu um erro inesperado."}
            </p>
            
            {this.state.retryCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Tentativa de recuperação #{this.state.retryCount}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Limpar cache local
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  setTimeout(() => window.location.reload(), 100);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                🔄 Recarregar e Limpar Cache
              </button>
              
              <button
                onClick={() => {
                  this.setState({ 
                    hasError: false, 
                    error: undefined,
                    retryCount: this.state.retryCount + 1 
                  });
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                disabled={this.state.retryCount >= 3}
              >
                🔧 Tentar Novamente {this.state.retryCount >= 3 ? '(Limite atingido)' : ''}
              </button>

              {isChromeMobile && (
                <button
                  onClick={() => {
                    // Abrir em nova aba sem service workers
                    const url = new URL(window.location.href);
                    url.searchParams.set('safe_mode', '1');
                    window.open(url.toString(), '_blank');
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  📱 Abrir em Modo Seguro
                </button>
              )}

              <button
                onClick={() => {
                  const homeUrl = window.location.origin;
                  window.location.href = homeUrl;
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                🏠 Voltar ao Início
              </button>
            </div>

            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Detalhes do erro (ID: {this.state.errorId})
                </summary>
                <div className="mt-2 space-y-2">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-24">
                    {this.state.error.message}
                  </pre>
                  <div className="text-xs text-gray-500">
                    <p>Navegador: {navigator.userAgent.slice(0, 50)}...</p>
                    <p>Tentativas: {this.state.retryCount}/3</p>
                    <p>Chrome Mobile: {isChromeMobile ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
