import * as React from "react"
import { useEffect, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { DomSafeManipulation, useSafeCleanup } from "@/utils/domSafeManipulation"

const cardVariants = cva(
  "rounded-lg border shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white/90 backdrop-blur-sm border-gray-200",
        transparent: "bg-green-50/85 backdrop-blur-sm border-green-100/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { addCleanup } = useSafeCleanup();
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Combinar refs de forma segura
  React.useImperativeHandle(ref, () => cardRef.current!);

  React.useEffect(() => {
    const element = cardRef.current;

    // Adicionar cleanup seguro
    addCleanup(() => {
      if (element && DomSafeManipulation.elementExists(element)) {
        // Limpeza segura se necessário
      }
    });
  }, [addCleanup]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { addCleanup } = useSafeCleanup();
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => headerRef.current!);

  React.useEffect(() => {
    const element = headerRef.current;
    addCleanup(() => {
      if (element && DomSafeManipulation.elementExists(element)) {
        // Limpeza segura se necessário
      }
    });
  }, [addCleanup]);

  return (
    <div
      ref={headerRef}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { addCleanup } = useSafeCleanup();
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  React.useImperativeHandle(ref, () => titleRef.current!);

  React.useEffect(() => {
    const element = titleRef.current;
    addCleanup(() => {
      if (element && DomSafeManipulation.elementExists(element)) {
        // Limpeza segura se necessário
      }
    });
  }, [addCleanup]);

  return (
    <h3
      ref={titleRef}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { addCleanup } = useSafeCleanup();
  const descRef = React.useRef<HTMLParagraphElement>(null);

  React.useImperativeHandle(ref, () => descRef.current!);

  React.useEffect(() => {
    const element = descRef.current;
    addCleanup(() => {
      if (element && DomSafeManipulation.elementExists(element)) {
        // Limpeza segura se necessário
      }
    });
  }, [addCleanup]);

  return (
    <p
      ref={descRef}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { addCleanup } = useSafeCleanup();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => contentRef.current!);

  React.useEffect(() => {
    const element = contentRef.current;
    addCleanup(() => {
      if (element && DomSafeManipulation.elementExists(element)) {
        // Limpeza segura se necessário
      }
    });
  }, [addCleanup]);

  return (
    <div 
      ref={contentRef} 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  );
});
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { addCleanup } = useSafeCleanup();
  const footerRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => footerRef.current!);

  React.useEffect(() => {
    const element = footerRef.current;
    addCleanup(() => {
      if (element && DomSafeManipulation.elementExists(element)) {
        // Limpeza segura se necessário
      }
    });
  }, [addCleanup]);

  return (
    <div
      ref={footerRef}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }