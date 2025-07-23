import { Link } from "wouter";
import { motion } from "framer-motion";
import AgricultureTractorIcon from "./AgricultureTractorIcon";
import FishingIcon from "./FishingIcon";
import PAAIcon from "./PAAIcon";

export const AreasSection = () => {
  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="py-16" id="areas">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-4xl font-bold text-center mb-12 text-white tracking-tight">
          ÁREAS DE ATUAÇÃO
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Agriculture Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <div className="group relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-200/50 hover:border-green-300 overflow-hidden min-h-[280px]">
              {/* Subtle background overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full">
                <AgricultureTractorIcon />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-green-600 transition-colors duration-300 tracking-wide">
                  Agricultura
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors text-sm mb-2">
                  Informações sobre agricultura e produção rural
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  Cadastro e solicitação de serviços disponíveis
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/agricultura" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
                  <div className="flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors cursor-pointer">
                    <span className="mr-2 text-sm uppercase tracking-wider">Explorar</span>
                    <svg
                      className="w-5 h-5 hover:translate-x-2 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
                <Link href="/agricultura/map" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
                  <div className="flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors cursor-pointer">
                    <span className="mr-2 text-sm uppercase tracking-wider">Acompanhe as atividades</span>
                    <svg
                      className="w-5 h-5 hover:translate-x-2 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Fishing Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <div className="group relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-200/50 hover:border-blue-300 overflow-hidden min-h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full">
                <FishingIcon />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 tracking-wide">
                  Pesca
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors text-sm mb-2">
                  Dados sobre pesca e atividades pesqueiras
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  Cadastro e solicitação de serviços disponíveis
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/pesca" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
                  <div className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer">
                    <span className="mr-2 text-sm uppercase tracking-wider">Explorar</span>
                    <svg
                      className="w-5 h-5 hover:translate-x-2 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
                <Link href="/pesca/map" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
                  <div className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer">
                    <span className="mr-2 text-sm uppercase tracking-wider">Acompanhe as atividades</span>
                    <svg
                      className="w-5 h-5 hover:translate-x-2 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* PAA Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <div className="group relative bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-200/50 hover:border-orange-300 overflow-hidden min-h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full">
                <PAAIcon />
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors duration-300 tracking-wide">
                  PAA
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors text-sm mb-2">
                  Programa de Aquisição de Alimentos
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  Cadastro e solicitação de serviços disponíveis
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/paa" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
                  <div className="flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors cursor-pointer">
                    <span className="mr-2 text-sm uppercase tracking-wider">Explorar</span>
                    <svg
                      className="w-5 h-5 hover:translate-x-2 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
                <Link href="/paa/map" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
                  <div className="flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors cursor-pointer">
                    <span className="mr-2 text-sm uppercase tracking-wider">Acompanhe as atividades</span>
                    <svg
                      className="w-5 h-5 hover:translate-x-2 transition-transform duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AreasSection;