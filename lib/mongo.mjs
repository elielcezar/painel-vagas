// Armazenamento no MongoDB Atlas (usado quando MONGODB_URI está definido).
// Documentos usam _id string no formato "<fonte>:<jobId>" para dedup natural.
import { MongoClient } from "mongodb";

const g = globalThis; // cache da conexão entre hot-reloads do Next em dev

async function coll() {
  if (!g.__mongoClientPromise) {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI não definido.");
    g.__mongoClientPromise = new MongoClient(process.env.MONGODB_URI).connect();
  }
  const client = await g.__mongoClientPromise;
  const db = client.db(process.env.MONGODB_DB || "painel_vagas");
  return db.collection("vagas");
}

export const mongoStore = {
  async getAll() {
    const c = await coll();
    return c.find({}).sort({ nota: -1, lastSeen: -1 }).toArray();
  },

  async upsertMany(vagas) {
    const c = await coll();
    const now = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    for (const v of vagas) {
      const { _id, status, firstSeen, statusAt, ...rest } = v;
      const r = await c.updateOne(
        { _id },
        {
          $setOnInsert: { status: status || "novo", firstSeen: now },
          $set: { ...rest, lastSeen: now },
        },
        { upsert: true }
      );
      if (r.upsertedCount) inserted++;
      else updated++;
    }
    return { inserted, updated };
  },

  async updateStatus(id, status) {
    const c = await coll();
    const r = await c.updateOne({ _id: id }, { $set: { status, statusAt: new Date().toISOString() } });
    return r.matchedCount > 0;
  },
};
