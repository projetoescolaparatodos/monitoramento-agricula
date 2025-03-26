import { Link } from "wouter";

const AreasSection = () => {
  const areas = [
    {
      id: 1,
      title: "Agricultura",
      description: "Informações sobre produção agrícola, cultivo e desenvolvimento rural no Brasil.",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "/agriculture",
      tags: ["Grãos", "Horticultura", "Fruticultura"]
    },
    {
      id: 2,
      title: "Pesca",
      description: "Dados e informações sobre a atividade pesqueira em águas continentais e marítimas do Brasil.",
      image: "https://images.unsplash.com/photo-1581837672885-d12734f9f6df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "/fishing",
      tags: ["Pesca Artesanal", "Aquicultura", "Pesca Industrial"]
    },
    {
      id: 3,
      title: "Programa de Aquisição de Alimentos (PAA)",
      description: "Informações sobre o PAA, que conecta produtores rurais a consumidores e instituições públicas.",
      image: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      link: "/paa",
      tags: ["Aquisição", "Distribuição", "Beneficiários"]
    }
  ];

  return (
    <section id="areas" className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-2">Áreas de Informação</h2>
        <p className="text-neutral max-w-3xl mx-auto">Explore dados detalhados por área de interesse</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {areas.map(area => (
          <div key={area.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={area.image} 
              alt={area.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold text-secondary mb-2">{area.title}</h3>
              <p className="text-neutral-dark mb-4">{area.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {area.tags.map((tag, index) => (
                  <span key={index} className="bg-neutral-light text-neutral-dark text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <Link href={area.link}>
                <a className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-md transition-colors">
                  Explorar dados
                </a>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AreasSection;
