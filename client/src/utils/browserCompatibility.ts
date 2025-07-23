
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

// Fix para elementos com gradient text que ficam invisíveis
export const fixGradientTextElements = () => {
  const browser = detectBrowser();
  
  if (browser === 'chrome' || browser === 'edge' || browser === 'safari') {
    const gradientElements = document.querySelectorAll('.gradient-text, .statistic-value, [style*="background-clip"], [style*="text-fill-color"]');
    
    gradientElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlElement);
      
      // Verifica se o elemento tem text transparente
      if (computedStyle.webkitTextFillColor === 'transparent' || 
          computedStyle.color === 'transparent') {
        
        // Aplica fallback temporário
        htmlElement.style.color = '#059669';
        htmlElement.style.webkitTextFillColor = 'initial';
        
        // Reaplica o gradient após pequeno delay
        setTimeout(() => {
          if (htmlElement.style.background) {
            htmlElement.style.webkitBackgroundClip = 'text';
            htmlElement.style.webkitTextFillColor = 'transparent';
            htmlElement.style.backgroundClip = 'text';
          }
        }, 50);
      }
    });
  }
};

// Fix para vídeos e iframes que não carregam corretamente
export const fixMediaElements = () => {
  const browser = detectBrowser();
  
  // Fix para iframes do Google Drive
  const driveIframes = document.querySelectorAll('iframe[src*="drive.google.com"]');
  driveIframes.forEach((iframe) => {
    const iframeElement = iframe as HTMLIFrameElement;
    
    // Força reload em Safari/Edge se não carregou
    if (browser === 'safari' || browser === 'edge') {
      iframeElement.style.border = 'none';
      iframeElement.style.outline = 'none';
      iframeElement.setAttribute('allowfullscreen', 'true');
      iframeElement.setAttribute('webkitallowfullscreen', 'true');
      iframeElement.setAttribute('mozallowfullscreen', 'true');
    }
  });
  
  // Fix para vídeos
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    if (browser === 'safari') {
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
    }
    
    // Força reload se não carregou
    if (video.readyState === 0) {
      video.load();
    }
  });
};

// Fix para CSS Grid e Flexbox em navegadores mais antigos
export const fixLayoutElements = () => {
  const browser = detectBrowser();
  
  // Fix para grids que quebram no Safari
  const gridElements = document.querySelectorAll('[class*="grid"], [style*="display: grid"]');
  gridElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    
    if (browser === 'safari') {
      // Adiciona prefixos webkit para Safari
      if (htmlElement.style.display === 'grid') {
        htmlElement.style.display = '-webkit-grid';
        htmlElement.style.display = 'grid';
      }
    }
  });
  
  // Fix para elementos flex
  const flexElements = document.querySelectorAll('[class*="flex"], [style*="display: flex"]');
  flexElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    
    if (browser === 'safari' || browser === 'edge') {
      if (htmlElement.style.display === 'flex') {
        htmlElement.style.display = '-webkit-flex';
        htmlElement.style.display = 'flex';
      }
    }
  });
};

// Fix para animações CSS que não funcionam corretamente
export const fixAnimationElements = () => {
  const browser = detectBrowser();
  
  if (browser === 'safari' || browser === 'edge') {
    const animatedElements = document.querySelectorAll('[class*="animate-"], [style*="animation"]');
    
    animatedElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Força hardware acceleration
      htmlElement.style.transform = htmlElement.style.transform || 'translateZ(0)';
      htmlElement.style.backfaceVisibility = 'hidden';
      htmlElement.style.webkitBackfaceVisibility = 'hidden';
    });
  }
};

// Fix para elementos de formulário que não estilizam corretamente
export const fixFormElements = () => {
  const browser = detectBrowser();
  
  if (browser === 'safari') {
    // Fix para inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      const inputElement = input as HTMLElement;
      inputElement.style.webkitAppearance = 'none';
      inputElement.style.appearance = 'none';
    });
    
    // Fix para botões
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      button.style.webkitAppearance = 'none';
      button.style.appearance = 'none';
    });
  }
};

// Fix para scroll suave que não funciona em todos os navegadores
export const fixSmoothScroll = () => {
  const browser = detectBrowser();
  
  if (browser === 'safari' || browser === 'edge') {
    // Polyfill para scroll suave
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href') || '');
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
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

// Função principal que aplica todos os fixes de compatibilidade
export const initBrowserCompatibility = () => {
  const browser = detectBrowser();
  console.log(`🔧 Iniciando correções de compatibilidade para: ${browser}`);
  
  // Aplica fixes iniciais
  fixGradientTextElements();
  fixMediaElements();
  fixLayoutElements();
  fixAnimationElements();
  fixFormElements();
  fixSmoothScroll();
  fixStatisticValueDisplay();
  
  // Observer universal para detectar mudanças no DOM
  const observer = new MutationObserver((mutations) => {
    let needsRefix = false;
    
    mutations.forEach((mutation) => {
      // Verifica se houve mudanças significativas
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        needsRefix = true;
      }
      
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
        needsRefix = true;
      }
      
      if (mutation.type === 'characterData') {
        const target = mutation.target.parentElement as HTMLElement;
        if (target && target.classList && target.classList.contains('statistic-value')) {
          needsRefix = true;
        }
      }
    });
    
    if (needsRefix) {
      setTimeout(() => {
        fixGradientTextElements();
        fixMediaElements();
        fixLayoutElements();
        fixStatisticValueDisplay();
      }, 100);
    }
  });
  
  // Observa mudanças em todo o documento
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
    attributeFilter: ['style', 'class']
  });
  
  // Aplica fixes quando a página carrega completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => initBrowserCompatibility(), 500);
    });
  }
  
  // Aplica fixes quando imagens e outros recursos carregam
  window.addEventListener('load', () => {
    setTimeout(() => {
      fixGradientTextElements();
      fixMediaElements();
      fixLayoutElements();
      fixStatisticValueDisplay();
    }, 1000);
  });
  
  // Fix periódico para garantir que elementos dinâmicos sejam corrigidos
  setInterval(() => {
    fixGradientTextElements();
    fixMediaElements();
  }, 5000);
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
