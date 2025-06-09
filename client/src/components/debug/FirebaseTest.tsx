
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

const FirebaseTest = () => {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testarColecoes = async () => {
    setLoading(true);
    const resultados: any[] = [];

    const colecoes = [
      'solicitacoes_agricultura_completo',
      'solicitacoes_agricultura',
      'solicitacoes_pesca_completo',
      'solicitacoes_pesca',
      'solicitacoes_paa',
      'solicitacoes_servicos'
    ];

    for (const nomeColecao of colecoes) {
      try {
        console.log(`🔍 Testando coleção: ${nomeColecao}`);
        const colecaoRef = collection(db, nomeColecao);
        const snapshot = await getDocs(colecaoRef);
        
        const resultado = {
          nome: nomeColecao,
          existe: true,
          vazia: snapshot.empty,
          tamanho: snapshot.size,
          documentos: snapshot.docs.map(doc => ({
            id: doc.id,
            dados: doc.data()
          }))
        };
        
        resultados.push(resultado);
        console.log(`✅ Resultado para ${nomeColecao}:`, resultado);
      } catch (error) {
        console.error(`❌ Erro ao testar ${nomeColecao}:`, error);
        resultados.push({
          nome: nomeColecao,
          existe: false,
          erro: error.message
        });
      }
    }

    setResultados(resultados);
    setLoading(false);
  };

  useEffect(() => {
    testarColecoes();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Teste de Conectividade Firebase</h1>
      
      <button 
        onClick={testarColecoes}
        disabled={loading}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Novamente'}
      </button>

      <div className="space-y-4">
        {resultados.map((resultado, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg">{resultado.nome}</h3>
            
            {resultado.existe ? (
              <>
                <p className="text-green-600">✅ Coleção acessível</p>
                <p>Vazia: {resultado.vazia ? '✅ Sim' : '❌ Não'}</p>
                <p>Tamanho: {resultado.tamanho}</p>
                
                {resultado.documentos && resultado.documentos.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold">Documentos encontrados:</h4>
                    <pre className="bg-gray-100 p-2 text-xs overflow-auto max-h-40">
                      {JSON.stringify(resultado.documentos, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-red-600">❌ Erro ao acessar</p>
                <p className="text-red-500">{resultado.erro}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirebaseTest;
