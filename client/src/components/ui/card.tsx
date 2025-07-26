
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onUnmount?: () => void;
  }
>(({ className, children, onUnmount, ...props }, ref) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isMountedRef = React.useRef(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Executar callback de unmount se fornecido
      onUnmount?.();
    };
  }, [onUnmount]);

  // Função segura para manipulação de DOM
  const safeDOMOperation = (callback: () => void) => {
    if (isMountedRef.current && cardRef.current && cardRef.current.isConnected) {
      try {
        callback();
      } catch (error) {
        console.warn('Operação DOM segura ignorou erro:', error);
      }
    }
  };

  // Combinar refs
  const combinedRef = React.useCallback((node: HTMLDivElement) => {
    cardRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <div
      ref={combinedRef}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {/* Renderizar children de forma segura */}
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // Adicionar key única para evitar problemas de reconciliação
          return React.cloneElement(child, {
            key: child.key || `card-child-${index}`,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  const titleRef = React.useRef<HTMLParagraphElement>(null);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Combinar refs
  const combinedRef = React.useCallback((node: HTMLParagraphElement) => {
    titleRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <h3
      ref={combinedRef}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const descRef = React.useRef<HTMLParagraphElement>(null);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Combinar refs
  const combinedRef = React.useCallback((node: HTMLParagraphElement) => {
    descRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <p
      ref={combinedRef}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Componente Text seguro integrado
const Text = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'default' | 'muted' | 'lead';
    onUnmount?: () => void;
  }
>(({ 
  variant = 'default', 
  children,
  onUnmount,
  className,
  ...props 
}, ref) => {
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const isMountedRef = React.useRef(true);
  const cleanupExecutedRef = React.useRef(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    cleanupExecutedRef.current = false;
    
    return () => {
      if (!cleanupExecutedRef.current) {
        cleanupExecutedRef.current = true;
        isMountedRef.current = false;
        
        // Executa limpeza segura se fornecido - sem manipulação DOM direta
        if (onUnmount && typeof onUnmount === 'function') {
          try {
            // Aguardar próximo tick para evitar conflitos
            setTimeout(() => {
              if (cleanupExecutedRef.current) {
                onUnmount();
              }
            }, 0);
          } catch (error) {
            console.warn('Erro na limpeza do componente Text:', error);
          }
        }
        
        // Limpar referência sem manipular DOM
        if (textRef.current) {
          console.debug('🧹 Limpando referência do componente Text');
          textRef.current = null;
        }
      }
    };
  }, [onUnmount]);

  // Combinar refs de forma mais segura
  const combinedRef = React.useCallback((node: HTMLParagraphElement | null) => {
    if (isMountedRef.current) {
      textRef.current = node;
      
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }
  }, [ref]);

  const baseClasses = 'text-base';
  const variantClasses = {
    default: 'text-gray-900',
    muted: 'text-gray-500', 
    lead: 'text-lg text-gray-700'
  };

  // Verificar se o componente ainda está montado antes de renderizar
  if (!isMountedRef.current && cleanupExecutedRef.current) {
    return null;
  }

  return (
    <p 
      ref={combinedRef}
      className={cn(baseClasses, variantClasses[variant], className)}
      data-component="text-safe"
      {...props}
    >
      {children}
    </p>
  );
});
Text.displayName = "Text"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, Text }
