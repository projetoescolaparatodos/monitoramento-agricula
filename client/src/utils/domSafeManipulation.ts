
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
