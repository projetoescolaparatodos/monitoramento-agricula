// Importa o JSON consolidado de produtores (gerado por extrair-produtores.py)
// para a coleção "produtores" do Firestore. O ID do documento é o cpfKey,
// então rodar de novo apenas atualiza os mesmos documentos (sem duplicar).
//
// Uso:  node scripts/importar-produtores.mjs           (importa)
//       node scripts/importar-produtores.mjs --dry-run (só valida e conta)

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAHOYOjHyvoRXkVhuQc_Ld3VrJtmqO1XM",
  authDomain: "transparencia-agricola.firebaseapp.com",
  projectId: "transparencia-agricola",
  storageBucket: "transparencia-agricola.firebasestorage.app",
  messagingSenderId: "667594200798",
  appId: "1:667594200798:web:77966c861af0943825944f",
};

const DRY_RUN = process.argv.includes("--dry-run");
const __dirname = dirname(fileURLToPath(import.meta.url));

const produtores = JSON.parse(
  readFileSync(join(__dirname, "data", "produtores-import.json"), "utf-8"),
);

console.log(`${DRY_RUN ? "[DRY-RUN] " : ""}${produtores.length} produtores no arquivo.`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const agora = new Date().toISOString();
const TAMANHO_LOTE = 400;
let gravados = 0;

for (let i = 0; i < produtores.length; i += TAMANHO_LOTE) {
  const lote = produtores.slice(i, i + TAMANHO_LOTE);
  if (!DRY_RUN) {
    const batch = writeBatch(db);
    for (const p of lote) {
      batch.set(
        doc(db, "produtores", p.cpfKey),
        { ...p, importadoEm: agora, atualizadoEm: agora },
        { merge: true },
      );
    }
    await batch.commit();
  }
  gravados += lote.length;
  console.log(`  ${gravados}/${produtores.length} gravados...`);
}

console.log(DRY_RUN ? "[DRY-RUN] Nada foi gravado." : "Importação concluída.");
process.exit(0);
