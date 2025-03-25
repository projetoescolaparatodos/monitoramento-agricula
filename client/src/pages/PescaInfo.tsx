import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PescaInfo = () => {
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Pesca em Vitória do Xingu</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sobre a Pesca</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            A atividade pesqueira em Vitória do Xingu é uma importante fonte de subsistência
            e renda para muitas famílias, além de contribuir para a segurança alimentar
            da população local.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Pescadores registrados: Em atualização</li>
              <li>Produção anual: Em atualização</li>
              <li>Principais espécies: Em atualização</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto Social</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A pesca artesanal é parte fundamental da cultura local, proporcionando
              sustento para as famílias e mantendo vivas as tradições pesqueiras da região.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PescaInfo;