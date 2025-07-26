export interface PerformanceMetrics {
  memoryUsage: number;
  domElements: number;
  eventListeners: number;
  promiseRejections: number;
  renderTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    domElements: 0,
    eventListeners: 0,
    promiseRejections: 0,
    renderTime: 0
  };

  private rejectionSources: string[] = [];

  startMonitoring(): void {
    // Monitorar promises rejeitadas com mais detalhes
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.promiseRejections++;

      // Tentar identificar a origem
      const stack = event.reason?.stack || new Error().stack;
      const source = this.extractSourceFromStack(stack);

      if (source && !this.rejectionSources.includes(source)) {
        this.rejectionSources.push(source);
        console.warn('📊 Nova fonte de promise rejeitada:', source);
      }

      // Silenciar objetos vazios automaticamente
      if (this.isEmptyObject(event.reason)) {
        event.preventDefault();
      }
    });

    // Monitoramento periódico
    setInterval(() => {
      this.updateMetrics();
      this.logMetricsIfNecessary();
    }, 30000);
  }

  private isEmptyObject(obj: any): boolean {
    return obj && 
           typeof obj === 'object' && 
           Object.keys(obj).length === 0 && 
           !obj.message && 
           !obj.stack;
  }

  private extractSourceFromStack(stack?: string): string | null {
    if (!stack) return null;

    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('client/src/')) {
        const match = line.match(/client\/src\/([^:]+)/);
        return match ? match[1] : null;
      }
    }
    return null;
  }

  private updateMetrics(): void {
    // Memória
    if (performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }

    // Elementos DOM
    this.metrics.domElements = document.querySelectorAll('*').length;

    // Event listeners (aproximação)
    this.metrics.eventListeners = document.querySelectorAll('[onclick], [onchange], [onsubmit]').length;

    // Tempo de render (última navegação)
    if (performance.navigation) {
      this.metrics.renderTime = performance.now();
    }
  }

  private logMetricsIfNecessary(): void {
    try {
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? 
        Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB' : 
        'N/A';

      const domElements = document.querySelectorAll('*').length;
      const formElements = document.querySelectorAll('form').length;
      const cardElements = document.querySelectorAll('[class*="card"]').length;
      const orphanElements = Array.from(document.querySelectorAll('*')).filter(el => !el.isConnected).length;

      console.log('📊 Métricas de performance:', {
        memoryUsage,
        domElements,
        formElements,
        cardElements,
        orphanElements,
        promiseRejections: this.metrics.promiseRejections,
        rejectionSources: this.rejectionSources.slice(-3)
      });

      // Alertas específicos
      if (orphanElements > 5) {
        console.warn('⚠️ Muitos elementos órfãos detectados:', orphanElements);
      }

      if (formElements > 3) {
        console.warn('⚠️ Muitos formulários ativos:', formElements);
      }

      // Reset counters
      this.metrics.promiseRejections = 0;
      this.rejectionSources = [];
    } catch (error) {
      console.warn('Erro ao coletar métricas:', error);
    }
  }

  getMetrics(): PerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  getRejectionSources(): string[] {
    return [...this.rejectionSources];
  }
}

export const performanceMonitor = new PerformanceMonitor();