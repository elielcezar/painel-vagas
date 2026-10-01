// Importa (upsert) um array de vagas no painel — usado pela "busca noturna".
// Uso:  npm run importar -- caminho/para/vagas.json
// Dedup por _id; se a vaga já existe, mantém o status (novo/enviado/dispensado).
import { readFileSync } from "fs";
import path from "path";
import { upsertMany, backendName } from "../lib/store.mjs";

// Node não carrega .env.local sozinho — fazemos manualmente para o modo Mongo funcionar.
function loadEnv() {
  try {
    const txt = readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* sem .env.local -> usa arquivo local */ }
}
loadEnv();

const file = process.argv[2];
if (!file) {
  console.error("Uso: npm run importar -- <arquivo.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(path.resolve(file), "utf8"));
const vagas = Array.isArray(raw) ? raw : raw.vagas || [];
const r = await upsertMany(vagas);
console.log(`Backend: ${backendName()}`);
console.log(`Importadas: ${r.inserted} novas, ${r.updated} atualizadas (total enviado: ${vagas.length}).`);
process.exit(0);
