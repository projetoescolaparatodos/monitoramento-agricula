
import { Card } from "@/components/ui/card";

interface Area {
  title: string;
  description: string;
  icon: string;
}

const areas: Area[] = [
  {
    title: "Produção Agrícola",
    description: "Acompanhamento da produção agrícola local",
    icon: "🌾"
  },
  {
    title: "Agricultura Familiar",
    description: "Suporte aos agricultores familiares",
    icon: "👨‍🌾"
  },
  {
    title: "Sustentabilidade",
    description: "Práticas agrícolas sustentáveis",
    icon: "🌱"
  }
];

const AreaSection = () => {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Áreas de Atuação</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {areas.map((area, index) => (
          <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{area.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{area.title}</h3>
            <p className="text-muted-foreground">{area.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AreaSection;
