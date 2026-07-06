// Migra estatísticas dinâmicas com período "safraAtual" para a safra específica
// em que as doações do evento aconteceram (ex.: "safra-2024" = Safra 2024/2025).
//
// Uso:  node scripts/migrate-safra-periodo.mjs           (aplica as mudanças)
//       node scripts/migrate-safra-periodo.mjs --dry-run (só mostra o que faria)

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAHOYOjHyvoRXkVhuQc_Ld3VrJtmqO1XM",
  authDomain: "transparencia-agricola.firebaseapp.com",
  projectId: "transparencia-agricola",
  storageBucket: "transparencia-agricola.firebasestorage.app",
  messagingSenderId: "667594200798",
  appId: "1:667594200798:web:77966c861af0943825944f",
};

const DRY_RUN = process.argv.includes("--dry-run");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ano-safra: 1º de julho a 30 de junho. Ex.: abril/2025 pertence à safra 2024/2025.
const safraDoTimestamp = (date) =>
  date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

async function main() {
  console.log(`${DRY_RUN ? "[DRY-RUN] " : ""}Buscando estatísticas com período "safraAtual"...`);

  const snapshot = await getDocs(
    query(collection(db, "estatisticas_dinamicas"), where("periodo", "==", "safraAtual")),
  );

  if (snapshot.empty) {
    console.log("Nenhuma estatística com período safraAtual encontrada. Nada a fazer.");
    return;
  }

  console.log(`Encontradas ${snapshot.size} estatísticas.\n`);

  for (const configDoc of snapshot.docs) {
    const config = configDoc.data();
    const titulo = config.titulo || configDoc.id;

    // Descobrir o eventoId do filtro adicional (quando existir)
    const filtros = Array.isArray(config.filtroAdicional) ? config.filtroAdicional : [];
    const eventoFiltro = filtros.find((f) => f.fieldPath === "eventoId" && f.value);

    // Buscar as datas dos registros que a estatística soma
    const colecao = config.colecaoFonte || "doacoes_evento";
    const campoData = colecao === "doacoes_evento" ? "timestamp" : "createdAt";

    let registrosQuery = query(collection(db, colecao));
    if (eventoFiltro) {
      registrosQuery = query(registrosQuery, where("eventoId", "==", eventoFiltro.value));
    }

    const registros = await getDocs(registrosQuery);
    let maisRecente = null;
    registros.forEach((r) => {
      const data = toDate(r.data()[campoData]);
      if (data && (!maisRecente || data > maisRecente)) maisRecente = data;
    });

    if (!maisRecente) {
      console.log(`⚠️  "${titulo}": nenhum registro encontrado em ${colecao}` +
        `${eventoFiltro ? ` para o evento ${eventoFiltro.value}` : ""} — mantida como safraAtual.`);
      continue;
    }

    const safra = safraDoTimestamp(maisRecente);
    const novoPeriodo = `safra-${safra}`;

    console.log(`✅ "${titulo}": último registro em ${maisRecente.toISOString().slice(0, 10)}` +
      ` → ${novoPeriodo} (Safra ${safra}/${safra + 1})`);

    if (!DRY_RUN) {
      await updateDoc(doc(db, "estatisticas_dinamicas", configDoc.id), {
        periodo: novoPeriodo,
      });
    }
  }

  console.log(`\n${DRY_RUN ? "[DRY-RUN] Nenhuma alteração gravada." : "Migração concluída."}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro na migração:", err);
    process.exit(1);
  });
