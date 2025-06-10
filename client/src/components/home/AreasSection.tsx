import { Link } from "wouter";
import { motion } from "framer-motion";

export const AreasSection = () => {
  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="py-16" id="areas">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-white tracking-tight font-sans">
          Áreas de Atuação
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Agriculture Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <Link href="/agriculture" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
              <div
                className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md p-8 cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-600/50 hover:border-green-300 overflow-hidden"
                role="link"
                aria-label="Explorar Agricultura"
              >
                {/* Subtle background overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-green-400 transition-colors duration-300 tracking-wide">
                  Agricultura
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors text-base">
                  Informações sobre agricultura e produção rural
                </p>
                <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                  <span className="mr-2 text-sm uppercase tracking-wider">Explorar</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
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
              </div>
            </Link>
          </motion.div>

          {/* Fishing Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <Link href="/fishing" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
              <div
                className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md p-8 cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-600/50 hover:border-blue-300 overflow-hidden"
                role="link"
                aria-label="Explorar Pesca"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-blue-400 transition-colors duration-300 tracking-wide">
                  Pesca
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors text-base">
                  Dados sobre pesca e atividades pesqueiras
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  <span className="mr-2 text-sm uppercase tracking-wider">Explorar</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
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
              </div>
            </Link>
          </motion.div>

          {/* PAA Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <Link href="/paa" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
              <div
                className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md p-8 cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-600/50 hover:border-orange-300 overflow-hidden"
                role="link"
                aria-label="Explorar PAA"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-orange-400 transition-colors duration-300 tracking-wide">
                  PAA
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors text-base">
                  Programa de Aquisição de Alimentos
                </p>
                <div className="mt-6 flex items-center text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                  <span className="mr-2 text-sm uppercase tracking-wider">Explorar</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
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
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AreasSection;