
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
