
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  initializeGoogleDriveAPI, 
  getGoogleDriveFileId, 
  getGoogleDriveFileMetadata,
  getGoogleDriveStreamingUrl 
} from '@/utils/driveHelper';

const GoogleDriveTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    if (!testUrl) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Verificar configuração da API
      const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
      console.log('Testing with API Key:', apiKey ? 'Configured' : 'Not configured');

      // Inicializar API
      const initialized = await initializeGoogleDriveAPI();
      console.log('API Initialized:', initialized);

      if (!initialized) {
        throw new Error('Failed to initialize Google Drive API');
      }

      // Extrair ID do arquivo
      const fileId = getGoogleDriveFileId(testUrl);
      console.log('File ID:', fileId);

      if (!fileId) {
        throw new Error('Could not extract file ID from URL');
      }

      // Buscar metadados
      const metadata = await getGoogleDriveFileMetadata(fileId);
      console.log('Metadata:', metadata);

      // Buscar URL de streaming
      const streamingUrl = await getGoogleDriveStreamingUrl(fileId);
      console.log('Streaming URL:', streamingUrl);

      setResult({
        fileId,
        metadata,
        streamingUrl,
        apiInitialized: initialized
      });

    } catch (err: any) {
      console.error('Test error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Google Drive API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Cole uma URL do Google Drive aqui..."
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
          />
          <Button onClick={testAPI} disabled={loading || !testUrl}>
            {loading ? 'Testando...' : 'Testar'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-100 border border-green-300 rounded">
            <h3 className="font-semibold mb-2">Resultado do Teste:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Status da API Key:</strong> {import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveTest;
