// Armazenamento em arquivo JSON local (fallback quando não há MONGODB_URI).
// Permite ver o painel funcionando sem configurar o banco.
import { promises as fs } from "fs";
import path from "path";
import { montarIndice, indexar, resolver } from "./merge.mjs";

const DATA = path.join(process.cwd(), "data", "vagas.json");
const SEED = path.join(process.cwd(), "data", "vagas.seed.json");

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(DATA, "utf8"));
  } catch {
    // primeira vez: inicializa a partir do seed de exemplo (se existir)
    try {
      const seed = JSON.parse(await fs.readFile(SEED, "utf8"));
      await writeAll(seed);
      return seed;
    } catch {
      return [];
    }
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(DATA), { recursive: true });
  await fs.writeFile(DATA, JSON.stringify(list, null, 2), "utf8");
}

export const fileStore = {
  async getAll() {
    const list = await readAll();
    return list.sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0));
  },

  async upsertMany(vagas) {
    const list = await readAll();
    const index = montarIndice(list);
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    for (const v of vagas) {
      const { doc, existing } = resolver(index, v, now);
      if (!doc._id) continue;
      if (existing) {
        list[list.indexOf(existing)] = doc;
        updated++;
      } else {
        list.push(doc);
        inserted++;
      }
      indexar(index, doc);
    }
    await writeAll(list);
    return { inserted, updated };
  },

  async updateStatus(id, status) {
    const list = await readAll();
    const v = list.find((x) => x._id === id);
    if (!v) return false;
    v.status = status;
    v.statusAt = new Date().toISOString();
    await writeAll(list);
    return true;
  },
};
