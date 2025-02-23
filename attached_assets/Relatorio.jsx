import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { CSVLink } from "react-csv";

const Relatorios = () => {
  const [tratores, setTratores] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroTratores, setFiltroTratores] = useState([]);

  useEffect(() => {
    const fetchTratores = async () => {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTratores(tratoresData);
    };

    fetchTratores();
  }, []);

  const filtrarPorPeriodo = () => {
    if (!dataInicio || !dataFim) {
      alert("Selecione um período válido.");
      return;
    }
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    const filtrados = tratores.filter((trator) => {
      const dataCadastro = new Date(trator.dataCadastro);
      return dataCadastro >= inicio && dataCadastro <= fim;
    });

    setFiltroTratores(filtrados);
  };

  const csvHeaders = [
    { label: "Nome", key: "nome" },
    { label: "Fazenda", key: "fazenda" },
    { label: "Atividade", key: "atividade" },
    { label: "Piloto", key: "piloto" },
    { label: "Tempo de Atividade (min)", key: "tempoAtividade" },
    { label: "Área Trabalhada", key: "areaTrabalhada" },
    { label: "Data de Cadastro", key: "dataCadastro" },
  ];

  return (
    <div>
      <h2>Relatórios de Atividades</h2>
      <label>Data Início:</label>
      <input
        type="date"
        value={dataInicio}
        onChange={(e) => setDataInicio(e.target.value)}
      />
      <label>Data Fim:</label>
      <input
        type="date"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
      />
      <button onClick={filtrarPorPeriodo}>Filtrar</button>

      <table border="1">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Fazenda</th>
            <th>Atividade</th>
            <th>Piloto</th>
            <th>Tempo de Atividade (min)</th>
            <th>Área Trabalhada</th>
            <th>Data de Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {filtroTratores.map((trator) => (
            <tr key={trator.id}>
              <td>{trator.nome}</td>
              <td>{trator.fazenda}</td>
              <td>{trator.atividade}</td>
              <td>{trator.piloto}</td>
              <td>{trator.tempoAtividade}</td>
              <td>{trator.areaTrabalhada || "N/A"}</td>
              <td>{trator.dataCadastro}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtroTratores.length > 0 && (
        <CSVLink data={filtroTratores} headers={csvHeaders} filename="relatorio_tratores.csv">
          <button>Exportar CSV</button>
        </CSVLink>
      )}
    </div>
  );
};

export default Relatorios;
