
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
