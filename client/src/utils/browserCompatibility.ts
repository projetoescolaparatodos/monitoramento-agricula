
// Utilitários para compatibilidade entre navegadores
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
    return 'chrome';
  } else if (userAgent.includes('Edge')) {
    return 'edge';
  } else if (userAgent.includes('Firefox')) {
    return 'firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'safari';
  }
  
  return 'unknown';
};

// Detectar dispositivos com pouca memória ou problemas conhecidos
export const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false;
  
  // Verificar memória disponível
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory <= 2) {
    return true;
  }
  
  // Verificar número de cores do processador
  const hardwareConcurrency = navigator.hardwareConcurrency;
  if (hardwareConcurrency && hardwareConcurrency <= 2) {
    return true;
  }
  
  // Verificar user agent para dispositivos conhecidamente problemáticos
  const userAgent = navigator.userAgent.toLowerCase();
  const isOldAndroid = userAgent.includes('android') && 
    (userAgent.includes('android 4') || userAgent.includes('android 5'));
  
  return isOldAndroid;
};

// Aplicar otimizações para dispositivos de baixo desempenho
export const applyLowEndOptimizations = () => {
  if (!isLowEndDevice()) return;
  
  console.log('🔧 Aplicando otimizações para dispositivo de baixo desempenho...');
  
  // Reduzir frequência de atualizações
  if (typeof window !== 'undefined') {
    const originalRAF = window.requestAnimationFrame;
    let lastTime = 0;
    const targetFPS = 30; // Limitar a 30 FPS em dispositivos fracos
    const targetInterval = 1000 / targetFPS;
    
    window.requestAnimationFrame = (callback) => {
      const now = Date.now();
      if (now - lastTime >= targetInterval) {
        lastTime = now;
        return originalRAF(callback);
      } else {
        return setTimeout(() => callback(now), targetInterval - (now - lastTime));
      }
    };
  }
};

export const fixStatisticValueDisplay = () => {
  const browser = detectBrowser();
  
  // Para Chrome e Edge, aplicar fix específico
  if (browser === 'chrome' || browser === 'edge') {
    const statisticValues = document.querySelectorAll('.statistic-value');
    
    statisticValues.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Força re-render para Chrome/Edge
      const computedStyle = window.getComputedStyle(htmlElement);
      const hasTransparentFill = computedStyle.webkitTextFillColor === 'transparent';
      
      if (hasTransparentFill) {
        // Temporariamente remove o background-clip para forçar visibilidade
        htmlElement.style.webkitTextFillColor = 'initial';
        htmlElement.style.backgroundClip = 'initial';
        
        // Reaplica os estilos após um pequeno delay
        setTimeout(() => {
          htmlElement.style.background = 'linear-gradient(45deg, #059669, #10b981)';
          htmlElement.style.webkitBackgroundClip = 'text';
          htmlElement.style.webkitTextFillColor = 'transparent';
          htmlElement.style.backgroundClip = 'text';
        }, 10);
      }
    });
  }
};

// Função para monitorar mudanças nos valores e aplicar fix
export const initStatisticValueWatcher = () => {
  const browser = detectBrowser();
  
  if (browser === 'chrome' || browser === 'edge') {
    // Observer para detectar mudanças nos valores
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target as HTMLElement;
          if (target.classList && target.classList.contains('statistic-value')) {
            setTimeout(() => fixStatisticValueDisplay(), 50);
          }
        }
      });
    });
    
    // Observa mudanças em todos os elementos com classe statistic-value
    const statisticValues = document.querySelectorAll('.statistic-value');
    statisticValues.forEach((element) => {
      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
    
    // Aplicar fix inicial
    setTimeout(() => fixStatisticValueDisplay(), 100);
  }
};
<file_path>client/src/utils/browserCompatibility.ts</file_path>
<line_number>1</line_number>
// Utilitários para melhorar compatibilidade com diferentes navegadores
export const browserCompatibility = {
  
  // Detectar se é Chrome Mobile
  isChromeMobile(): boolean {
    const userAgent = navigator.userAgent;
    return /Chrome|CriOS/i.test(userAgent) && /Mobile|Android/i.test(userAgent);
  },

  // Detectar se é Safari
  isSafari(): boolean {
    return /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
  },

  // Detectar problemas de memória
  hasMemoryIssues(): boolean {
    // @ts-ignore
    const memory = (performance as any).memory;
    if (memory) {
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return memoryUsage > 0.8; // 80% de uso da memória
    }
    return false;
  },

  // Limpar cache e storage quando necessário
  clearCacheAndStorage(): Promise<void> {
    return new Promise((resolve) => {
      try {
        // Limpar localStorage
        localStorage.clear();
        
        // Limpar sessionStorage
        sessionStorage.clear();
        
        // Limpar cache se disponível
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
            return Promise.all(deletePromises);
          }).then(() => resolve());
        } else {
          resolve();
        }
      } catch (error) {
        console.warn('Erro ao limpar cache:', error);
        resolve();
      }
    });
  },

  // Aplicar otimizações específicas para Chrome Mobile
  applyChromeMobileOptimizations(): void {
    if (this.isChromeMobile()) {
      // Reduzir frequência de renderização
      const style = document.createElement('style');
      style.textContent = `
        * {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        .map-container {
          will-change: transform;
          -webkit-will-change: transform;
        }
        
        .info-window {
          max-height: 70vh !important;
          overflow-y: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      // Otimizar eventos de touch
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  },

  // Detectar e prevenir memory leaks
  preventMemoryLeaks(): void {
    // Limpar intervals e timeouts automaticamente
    const originalSetInterval = window.setInterval;
    const originalSetTimeout = window.setTimeout;
    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    window.setInterval = function(callback: Function, ms: number) {
      const id = originalSetInterval(callback, ms);
      intervals.push(id);
      return id;
    };

    window.setTimeout = function(callback: Function, ms: number) {
      const id = originalSetTimeout(callback, ms);
      timeouts.push(id);
      return id;
    };

    // Limpar na mudança de página
    window.addEventListener('beforeunload', () => {
      intervals.forEach(id => clearInterval(id));
      timeouts.forEach(id => clearTimeout(id));
    });
  },

  // Monitorar performance e alertar sobre problemas
  monitorPerformance(): void {
    if ('performance' in window) {
      // Monitorar Long Tasks (tarefas que demoram mais que 50ms)
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn('Long task detectada:', entry.duration + 'ms');
            }
          });
        });
        
        try {
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // Fallback se longtask não for suportado
          console.log('PerformanceObserver longtask não suportado');
        }
      }

      // Monitorar uso de memória
      setInterval(() => {
        if (this.hasMemoryIssues()) {
          console.warn('Alto uso de memória detectado');
          // Tentar forçar garbage collection se disponível
          if ('gc' in window) {
            (window as any).gc();
          }
        }
      }, 30000); // Verificar a cada 30 segundos
    }
  },

  // Inicializar todas as otimizações
  initialize(): void {
    console.log('Inicializando otimizações de compatibilidade...');
    
    this.applyChromeMobileOptimizations();
    this.preventMemoryLeaks();
    this.monitorPerformance();
    
    // Log de informações do navegador para debug
    console.log('Informações do navegador:', {
      userAgent: navigator.userAgent,
      isChromeMobile: this.isChromeMobile(),
      isSafari: this.isSafari(),
      hasMemoryAPI: 'memory' in performance,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasWebGL: !!document.createElement('canvas').getContext('webgl')
    });
  }
};

// Auto-inicializar quando o módulo for carregado
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    browserCompatibility.initialize();
  });
}
