import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Text } from '@/components/ui/card';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useSafeCleanup } from '@/utils/domSafeManipulation';

const FormAgricultura: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCleanup, executeCleanup, isMounted: isSafelyMounted } = useSafeCleanup();

  useEffect(() => {
    setIsMounted(true);

    // Registrar função de limpeza
    addCleanup(() => {
      console.log('🧹 Limpeza do FormAgricultura executada');
    });

    return () => {
      // Limpeza segura com atraso para evitar conflitos de DOM
      setTimeout(() => {
        if (isSafelyMounted()) {
          executeCleanup();
        }
        setIsMounted(false);
      }, 100);
    };
  }, [addCleanup, executeCleanup, isSafelyMounted]);

  // Função de submit segura
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMounted || !isSafelyMounted() || isSubmitting) {
      console.warn('FormAgricultura: Submit cancelado - componente não está em estado seguro');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sua lógica de submit aqui
      console.log('📝 Processando formulário de agricultura...');

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ Formulário processado com sucesso');
    } catch (error) {
      console.error('❌ Erro no submit do formulário:', error);
    } finally {
      if (isSafelyMounted()) {
        setIsSubmitting(false);
      }
    }
  }, [isMounted, isSafelyMounted, isSubmitting]);

  // Renderização condicional segura
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando formulário...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <div className="p-4 bg-red-50 text-red-700 rounded-lg shadow-md max-w-md mx-auto mt-8">
          <h3 className="font-bold mb-2">Erro no Formulário</h3>
          <p>O formulário encontrou um erro. Por favor, recarregue a página.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recarregar Página
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('🔥 ErrorBoundary - Erro capturado no FormAgricultura:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        });
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card 
            className="shadow-lg"
            onUnmount={() => {
              console.log('🔄 Card do FormAgricultura sendo desmontado');
            }}
          >
            <CardHeader>
              <CardTitle className="text-green-700 text-center">
                Formulário de Agricultura
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Text variant="lead" className="text-center text-gray-600">
                  Sistema de Cadastro Agrícola - SEMAPA
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produtor
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Digite o nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Plantada (ha)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cultura Principal
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Selecione a cultura</option>
                      <option value="milho">Milho</option>
                      <option value="soja">Soja</option>
                      <option value="cacau">Cacau</option>
                      <option value="banana">Banana</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Informações adicionais sobre a propriedade..."
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processando...' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FormAgricultura;