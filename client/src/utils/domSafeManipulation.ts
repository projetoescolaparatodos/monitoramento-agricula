
import React from 'react';

/**
 * Sistema de diagnóstico para componentes React
 */
export const diagnoseReactComponents = (): void => {
  try {
    console.group('🔍 Diagnóstico de Componentes React');

    // Verificar versões das bibliotecas críticas
    const reactVersion = React.version;
    console.log('React version:', reactVersion);

    // Verificar elementos DOM com problemas conhecidos
    const problematicElements = document.querySelectorAll('[data-component]');
    console.log('Componentes com data-component:', problematicElements.length);

    // Verificar uso de findDOMNode (deprecated)
    const reactDOMElements = document.querySelectorAll('[data-reactroot]');
    console.log('Elementos React DOM encontrados:', reactDOMElements.length);

    // Verificar elementos com muitos event listeners
    const elementsWithListeners = Array.from(document.querySelectorAll('*')).filter(el => {
      return Object.keys(el).some(key => key.startsWith('__reactEventHandlers'));
    });
    console.log('Elementos com event handlers React:', elementsWithListeners.length);

    // Verificar cards potencialmente problemáticos
    const cards = document.querySelectorAll('[class*="card"]');
    let problematicCards = 0;
    
    cards.forEach(card => {
      if (!card.isConnected) {
        problematicCards++;
        console.warn('Card desconectado encontrado:', card);
      }
    });
    
    console.log('Cards problemáticos:', problematicCards);

    // Verificar componentes Text
    const textComponents = document.querySelectorAll('[data-component="text-safe"]');
    console.log('Componentes Text seguros:', textComponents.length);

    console.groupEnd();
  } catch (error) {
    console.error('Erro durante diagnóstico de componentes:', error);
  }
};

/**
 * Monitorar mudanças de estado em componentes React
 */
export const createReactStateMonitor = (): (() => void) => {
  const stateChanges: Array<{timestamp: number, type: string, details: any}> = [];
  
  const originalSetState = React.Component.prototype.setState;
  React.Component.prototype.setState = function(partialState, callback) {
    stateChanges.push({
      timestamp: Date.now(),
      type: 'setState',
      details: {
        component: this.constructor.name,
        state: partialState
      }
    });
    
    return originalSetState.call(this, partialState, callback);
  };

  // Cleanup function
  return () => {
    React.Component.prototype.setState = originalSetState;
    console.log('Estado monitorado:', stateChanges.slice(-10)); // Últimas 10 mudanças
  };
};



import React from 'react';

export class DomSafeManipulation {
  /**
   * Verifica se um nó é filho de um parent de forma segura
   */
  static isChildOf(parent: Node | null, child: Node | null): boolean {
    try {
      if (!parent || !child) return false;
      return parent.contains(child);
    } catch (error) {
      console.warn('Erro ao verificar relação parent-child:', error);
      return false;
    }
  }

  /**
   * Remove um elemento do DOM apenas se ele estiver conectado
   */
  static safeRemoveIfConnected(element: Element | null): boolean {
    try {
      if (!element) return false;
      
      // Verificar se o elemento está conectado ao DOM
      if (!element.isConnected) {
        console.warn('Elemento não está conectado ao DOM');
        return false;
      }

      // Verificar se tem parent
      if (!element.parentNode) {
        console.warn('Elemento não tem parentNode');
        return false;
      }

      return this.safeRemoveChild(element.parentNode, element);
    } catch (error) {
      console.error('Erro ao remover elemento conectado:', error);
      return false;
    }
  }

  /**
   * Adiciona um observer para mudanças no DOM de forma segura
   */
  static createSafeMutationObserver(
    callback: MutationCallback,
    options: MutationObserverInit = {}
  ): MutationObserver | null {
    try {
      if (!window.MutationObserver) {
        console.warn('MutationObserver não está disponível');
        return null;
      }

      const observer = new MutationObserver((mutations, obs) => {
        try {
          callback(mutations, obs);
        } catch (error) {
          console.error('Erro no callback do MutationObserver:', error);
        }
      });

      return observer;
    } catch (error) {
      console.error('Erro ao criar MutationObserver:', error);
      return null;
    }
  }
  /**
   * Remove um elemento do DOM de forma segura
   */
  static safeRemoveChild(parent: Node | null, child: Node | null): boolean {
    try {
      if (!parent || !child) {
        console.warn('Parent ou child é null/undefined');
        return false;
      }

      // Verificar se o child realmente é filho do parent
      if (!parent.contains(child)) {
        console.warn('Child não é filho do parent especificado');
        return false;
      }

      parent.removeChild(child);
      return true;
    } catch (error) {
      console.error('Erro ao remover child do DOM:', error);
      return false;
    }
  }

  /**
   * Adiciona um elemento ao DOM de forma segura
   */
  static safeAppendChild(parent: Node | null, child: Node | null): boolean {
    try {
      if (!parent || !child) {
        console.warn('Parent ou child é null/undefined');
        return false;
      }

      parent.appendChild(child);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar child ao DOM:', error);
      return false;
    }
  }

  /**
   * Limpa todos os filhos de um elemento de forma segura
   */
  static safeClearChildren(parent: Element | null): boolean {
    try {
      if (!parent) {
        console.warn('Parent é null/undefined');
        return false;
      }

      // Usar innerHTML é mais seguro que removeChild em loop
      parent.innerHTML = '';
      return true;
    } catch (error) {
      console.error('Erro ao limpar children do DOM:', error);
      return false;
    }
  }

  /**
   * Verifica se um elemento existe no DOM
   */
  static elementExists(element: Element | null): boolean {
    if (!element) return false;
    return document.contains(element);
  }

  /**
   * Remove event listeners de forma segura
   */
  static safeRemoveEventListener(
    element: Element | null, 
    event: string, 
    handler: EventListener
  ): boolean {
    try {
      if (!element) {
        console.warn('Element é null/undefined');
        return false;
      }

      element.removeEventListener(event, handler);
      return true;
    } catch (error) {
      console.error('Erro ao remover event listener:', error);
      return false;
    }
  }
}

/**
 * Verifica a integridade geral do DOM
 */
export const checkDomIntegrity = (): boolean => {
  try {
    // Verificar se o documento está disponível
    if (!document || !document.body) {
      console.warn('DOM não está disponível');
      return false;
    }

    // Verificar se há elementos órfãos conhecidos
    const cards = document.querySelectorAll('[class*="card"]');
    const forms = document.querySelectorAll('form');
    const buttons = document.querySelectorAll('button');
    
    let orphanCount = 0;
    let performanceIssues = 0;
    
    // Verificar cards órfãos
    cards.forEach(card => {
      if (card && !card.isConnected) {
        orphanCount++;
      }
    });

    // Verificar elementos com muitos event listeners
    const elementsWithListeners = document.querySelectorAll('[data-listener-count]');
    if (elementsWithListeners.length > 50) {
      performanceIssues++;
      console.warn(`Muitos elementos com listeners: ${elementsWithListeners.length}`);
    }

    // Verificar memory leaks potenciais
    if (buttons.length > 200) {
      console.warn(`Muitos botões renderizados: ${buttons.length}`);
      performanceIssues++;
    }

    if (orphanCount > 0) {
      console.warn(`Encontrados ${orphanCount} elementos órfãos no DOM`);
    }

    // Verificar performance da página
    if (performance && performance.memory) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        console.warn('Alto uso de memória JavaScript detectado:', {
          used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + 'MB'
        });
        performanceIssues++;
      }
    }

    return orphanCount === 0 && performanceIssues < 3;
  } catch (error) {
    console.error('Erro ao verificar integridade do DOM:', error);
    return false;
  }
};

/**
 * Sistema de limpeza automática de recursos
 */
export const performAutomaticCleanup = (): void => {
  try {
    // Limpar event listeners órfãos
    const elementsWithListeners = document.querySelectorAll('[data-cleanup-needed]');
    elementsWithListeners.forEach(el => {
      if (!el.isConnected) {
        el.remove();
      }
    });

    // Forçar garbage collection se disponível (apenas desenvolvimento)
    if (typeof window.gc === 'function' && process.env.NODE_ENV === 'development') {
      window.gc();
    }

    // Limpar cache de imagens quebradas
    const brokenImages = document.querySelectorAll('img[src=""]');
    brokenImages.forEach(img => {
      if (img.parentNode) {
        img.remove();
      }
    });

    console.log('🧹 Limpeza automática concluída');
  } catch (error) {
    console.warn('Erro durante limpeza automática:', error);
  }
};

/**
 * Hook personalizado para cleanup seguro de componentes
 */
export const useSafeCleanup = () => {
  const cleanupFunctions = React.useRef<(() => void)[]>([]);
  const isMountedRef = React.useRef(true);

  const addCleanup = React.useCallback((fn: () => void) => {
    if (isMountedRef.current) {
      cleanupFunctions.current.push(fn);
    }
  }, []);

  const executeCleanup = React.useCallback(() => {
    if (!isMountedRef.current) return;
    
    // Executar todas as funções de cleanup de forma segura
    cleanupFunctions.current.forEach((fn, index) => {
      try {
        fn();
      } catch (error) {
        console.warn(`Erro durante cleanup da função ${index}:`, error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      executeCleanup();
    };
  }, [executeCleanup]);

  return { 
    addCleanup, 
    executeCleanup,
    isMounted: () => isMountedRef.current 
  };
};
