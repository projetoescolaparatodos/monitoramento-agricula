import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import Upload from "../components/Upload";

const Admin = () => {
  const [nome, setNome] = useState("");
  const [fazenda, setFazenda] = useState("");
  const [atividade, setAtividade] = useState("");
  const [piloto, setPiloto] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [midias, setMidias] = useState([]);
  const [tempoAtividade, setTempoAtividade] = useState(0);
  const [dataCadastro, setDataCadastro] = useState(new Date().toISOString().split("T")[0]);
  const [tratoresCadastrados, setTratoresCadastrados] = useState([]);
  const [tratorEmEdicao, setTratorEmEdicao] = useState(null);

  // Busca os tratores ao carregar o componente
  useEffect(() => {
    const fetchTratores = async () => {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTratoresCadastrados(tratoresData);
    };

    fetchTratores();
  }, []);

  // Inicializa o mapa
  useEffect(() => {
    const map = L.map("admin-map").setView([-2.87922, -52.0088], 12); // Coordenadas iniciais e nível de zoom

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Adiciona um evento de clique no mapa para capturar as coordenadas
    map.on("click", (e) => {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map); // Adiciona um marcador no local clicado
    });

    // Limpa o mapa ao desmontar o componente
    return () => map.remove();
  }, []);

  // Atualiza o estado dos tratores quando o tempo de atividade é atingido
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const tratoresAtualizados = tratoresCadastrados.map((trator) => {
        if (!trator.concluido) {
          const tempoDecorrido = (now - new Date(trator.dataCadastro)) / 1000; // Tempo em segundos
          if (tempoDecorrido >= trator.tempoAtividade * 60) {
            return { ...trator, concluido: true };
          }
        }
        return trator;
      });
      setTratoresCadastrados(tratoresAtualizados);
    }, 1000); // Verifica a cada segundo

    return () => clearInterval(interval);
  }, [tratoresCadastrados]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      alert("Clique no mapa para selecionar a localização do trator.");
      return;
    }

    try {
      const tratorData = {
        nome,
        fazenda,
        atividade,
        piloto,
        latitude,
        longitude,
        midias,
        dataCadastro: tratorEmEdicao ? tratorEmEdicao.dataCadastro : dataCadastro,
        tempoAtividade: tratorEmEdicao ? tratorEmEdicao.tempoAtividade : tempoAtividade,
        concluido: false, // Inicialmente, a atividade não está concluída
      };

      if (tratorEmEdicao) {
        // Atualiza o trator existente
        await updateDoc(doc(db, "tratores", tratorEmEdicao.id), tratorData);
        alert("Trator atualizado com sucesso!");
      } else {
        // Adiciona um novo trator
        await addDoc(collection(db, "tratores"), tratorData);
        alert("Trator adicionado com sucesso!");
      }

      // Limpa o formulário e recarrega a lista de tratores
      setNome("");
      setFazenda("");
      setAtividade("");
      setPiloto("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setTempoAtividade(0);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setTratorEmEdicao(null);

      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTratoresCadastrados(tratoresData);
    } catch (error) {
      console.error("Erro ao salvar trator:", error);
    }
  };

  const handleUpload = (url) => {
    setMidias([...midias, url]); // Adiciona a URL da mídia ao estado
  };

  const handleEditarTrator = (trator) => {
    setTratorEmEdicao(trator);
    setNome(trator.nome);
    setFazenda(trator.fazenda);
    setAtividade(trator.atividade);
    setPiloto(trator.piloto);
    setLatitude(trator.latitude);
    setLongitude(trator.longitude);
    setMidias(trator.midias || []);
    setTempoAtividade(trator.tempoAtividade);
    setDataCadastro(trator.dataCadastro);
  };

  const handleExcluirTrator = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este trator?")) {
      try {
        await deleteDoc(doc(db, "tratores", id));
        alert("Trator excluído com sucesso!");
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTratoresCadastrados(tratoresData);
      } catch (error) {
        console.error("Erro ao excluir trator:", error);
      }
    }
  };

  return (
    <div>
      <h2>Painel Admin</h2>
      <div id="admin-map" style={{ width: "100%", height: "400px", marginBottom: "20px" }}></div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome do Trator"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Fazenda"
          value={fazenda}
          onChange={(e) => setFazenda(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Atividade"
          value={atividade}
          onChange={(e) => setAtividade(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Piloto"
          value={piloto}
          onChange={(e) => setPiloto(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Tempo de Atividade (minutos)"
          value={tempoAtividade}
          onChange={(e) => setTempoAtividade(e.target.value)}
          required
        />
        <input
          type="date"
          value={dataCadastro}
          onChange={(e) => setDataCadastro(e.target.value)}
          required
        />
        <div>
          <h4>Fotos/Vídeos:</h4>
          <Upload onUpload={handleUpload} />
          {midias.map((url, index) => (
            <img key={index} src={url} alt={`Mídia ${index}`} style={{ maxWidth: "100px", margin: "5px" }} />
          ))}
        </div>
        <button type="submit">{tratorEmEdicao ? "Atualizar Trator" : "Adicionar Trator"}</button>
      </form>

      <div>
        <h3>Tratores Cadastrados</h3>
        <ul>
          {tratoresCadastrados.map((trator) => (
            <li key={trator.id} style={{ marginBottom: "10px" }}>
              <strong>{trator.nome}</strong> - {trator.fazenda} ({trator.concluido ? "Concluído" : "Em Serviço"})
              <button onClick={() => handleEditarTrator(trator)} style={{ marginLeft: "10px" }}>Editar</button>
              <button onClick={() => handleExcluirTrator(trator.id)} style={{ marginLeft: "10px" }}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Admin;