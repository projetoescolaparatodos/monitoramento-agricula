import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="home-container"
      style={{ backgroundImage: "url('/images/plantacao.jpg')" }}
    >
      <div className="home-content">
        <h1 className="home-title">
          Secretaria de Agricultura - Vitória do Xingu
        </h1>
        <p className="home-description">Monitoramento de serviços agrícolas</p>
        <div className="home-buttons">
          <button
            onClick={() => navigate("/map")} // Redireciona para /map
            className="home-button green"
          >
            Acompanhar Serviços
          </button>
          <button
            onClick={() => navigate("/relatorio")}
            className="home-button blue"
          >
            Gerar Relatórios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;