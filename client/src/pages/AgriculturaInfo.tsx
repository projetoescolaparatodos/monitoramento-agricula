import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AgriculturaInfo = () => {
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Agricultura em Vitória do Xingu</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sobre a Agricultura</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            A agricultura em Vitória do Xingu é uma atividade fundamental para o desenvolvimento
            econômico e social do município, fornecendo alimentos e gerando renda para as
            famílias locais.
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
              <li>Produtores cadastrados: Em atualização</li>
              <li>Área total cultivada: Em atualização</li>
              <li>Principais culturas: Em atualização</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto Econômico</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A agricultura local contribui significativamente para a economia do município,
              gerando empregos e fomentando o comércio local através da produção e
              comercialização de produtos agrícolas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgriculturaInfo;