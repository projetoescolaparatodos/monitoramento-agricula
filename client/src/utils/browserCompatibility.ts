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

export const fixStatisticValueDisplay = () => {
  try {
    const browser = detectBrowser();

    if (browser === 'chrome' || browser === 'edge') {
      const statisticValues = document.querySelectorAll('.statistic-value');

      statisticValues.forEach((element) => {
        try {
          const htmlElement = element as HTMLElement;

          // Verificar se o elemento ainda existe e está no DOM
          if (!htmlElement || !htmlElement.parentNode || !document.contains(htmlElement)) {
            return;
          }

          // Verificar se o elemento não foi removido durante a operação
          if (!htmlElement.isConnected) {
            return;
          }

          // Force reflow específico para Chrome/Edge
          const originalTransform = htmlElement.style.transform;
          htmlElement.style.transform = 'translateZ(0)';

          // Força recalculo do layout
          void htmlElement.offsetHeight;

          // Restaura transform original de forma segura
          setTimeout(() => {
            // Verificação adicional antes de modificar
            if (htmlElement && 
                htmlElement.parentNode && 
                document.contains(htmlElement) && 
                htmlElement.isConnected) {
              htmlElement.style.transform = originalTransform;
            }
          }, 10);
        } catch (elementError) {
          console.warn("Erro ao aplicar fix em elemento específico:", elementError);
        }
      });
    }
  } catch (error) {
    console.error("Erro geral no fixStatisticValueDisplay:", error);
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

          // Verificações de segurança antes de processar
          if (target && 
              target.classList && 
              target.classList.contains('statistic-value') &&
              document.contains(target) &&
              target.isConnected) {
            setTimeout(() => fixStatisticValueDisplay(), 50);
          }
        }
      });
    });

    // Observa mudanças em todos os elementos com classe statistic-value
    const statisticValues = document.querySelectorAll('.statistic-value');
    statisticValues.forEach((element) => {
      try {
        // Verificar se o elemento é válido antes de observar
        if (element && document.contains(element) && (element as HTMLElement).isConnected) {
          observer.observe(element, {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      } catch (observerError) {
        console.warn("Erro ao configurar observer para elemento:", observerError);
      }
    });

    // Aplicar fix inicial
    setTimeout(() => fixStatisticValueDisplay(), 100);

    // Retornar função de cleanup
    return () => {
      try {
        observer.disconnect();
      } catch (disconnectError) {
        console.warn("Erro ao desconectar observer:", disconnectError);
      }
    };
  }

  return () => {}; // Função vazia para browsers que não precisam do fix
};

// Detecção específica de problemas conhecidos no Chrome
const detectChromeIssues = (): string[] => {
  const issues: string[] = [];

  if (isChrome()) {
    // Verificar versão do Chrome para problemas conhecidos
    const chromeVersion = getChromeVersion();

    if (chromeVersion && chromeVersion >= 90 && chromeVersion <= 95) {
      issues.push('Versão do Chrome pode ter problemas com manipulação de DOM');
    }

    // Verificar se há extensões que podem interferir
    if (navigator.plugins.length > 10) {
      issues.push('Muitas extensões podem causar conflitos de DOM');
    }

    // Verificar se está em modo de desenvolvimento
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('replit')) {
      issues.push('Ambiente de desenvolvimento - logs de DOM habilitados');
    }
  }

  return issues;
};

const getChromeVersion = (): number | null => {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

export const checkBrowserCompatibility = (): BrowserCompatibilityResult => {
  // Adicionar detecção específica de problemas do Chrome
  const chromeIssues = detectChromeIssues();
  warnings.push(...chromeIssues);

  return {
    isSupported: true,
    browser: browserInfo,
    features: featureSupport,
    warnings
  };
};