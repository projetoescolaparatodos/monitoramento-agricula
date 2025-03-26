import { Link } from "wouter";

export const AreasSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Áreas de Atuação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/agricultura">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Agricultura</h3>
              <p className="text-gray-600">Informações sobre a agricultura local, programas e iniciativas.</p>
            </div>
          </Link>

          <Link href="/pesca">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">Pesca</h3>
              <p className="text-gray-600">Dados sobre a atividade pesqueira e projetos relacionados.</p>
            </div>
          </Link>

          <Link href="/paa">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-4">PAA</h3>
              <p className="text-gray-600">Programa de Aquisição de Alimentos e seus benefícios.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AreasSection;