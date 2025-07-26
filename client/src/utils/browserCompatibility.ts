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
          if (!htmlElement || !htmlElement.parentNode) {
            return;
          }

          // Force reflow específico para Chrome/Edge
          const originalTransform = htmlElement.style.transform;
          htmlElement.style.transform = 'translateZ(0)';

          // Força recalculo do layout
          void htmlElement.offsetHeight;

          // Restaura transform original de forma segura
          setTimeout(() => {
            if (htmlElement && htmlElement.parentNode) {
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