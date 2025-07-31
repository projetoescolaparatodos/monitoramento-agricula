
<line_number>1</line_number>
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOptimizerProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

const LoadingOptimizer: React.FC<LoadingOptimizerProps> = ({
  isLoading,
  children,
  fallback,
  delay = 200
}) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delay]);

  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        {fallback || (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Carregando dados...</p>
            <p className="text-gray-500 text-sm mt-2">Conectando ao servidor</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingOptimizer;
