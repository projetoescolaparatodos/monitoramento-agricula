
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
    const memoryMB = Math.round(this.metrics.memoryUsage / 1024 / 1024);
    
    if (memoryMB > 100 || this.metrics.domElements > 1000 || this.metrics.promiseRejections > 10) {
      console.warn('📊 Métricas de performance:', {
        memoryUsage: `${memoryMB}MB`,
        domElements: this.metrics.domElements,
        promiseRejections: this.metrics.promiseRejections,
        rejectionSources: this.rejectionSources
      });
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
