
import React from 'react';

export class DomSafeManipulation {
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

  const addCleanup = React.useCallback((fn: () => void) => {
    cleanupFunctions.current.push(fn);
  }, []);

  React.useEffect(() => {
    return () => {
      // Executar todas as funções de cleanup de forma segura
      cleanupFunctions.current.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn('Erro durante cleanup:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);

  return { addCleanup };
};
