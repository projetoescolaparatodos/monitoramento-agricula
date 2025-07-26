
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    
    // Log específico para erros de DOM
    if (error.message.includes('removeChild') || 
        error.message.includes('Node') ||
        error.message.includes('insertBefore') ||
        error.message.includes('appendChild')) {
      console.error("🔴 DOM manipulation error detected:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });

      // Tentar identificar o componente problemático
      const componentMatch = errorInfo.componentStack?.match(/at (\w+)/);
      if (componentMatch) {
        console.error("Componente problemático identificado:", componentMatch[1]);
      }
    }

    // Log para erros de React relacionados a refs
    if (error.message.includes('ref') || error.message.includes('current')) {
      console.error("🟡 React ref error detected:", {
        error: error.message,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Erro no componente</h3>
          <p className="text-red-600 text-sm">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
