// Seleciona o backend: MongoDB se houver MONGODB_URI, senão arquivo local.
// Imports estáticos (o mongo só abre conexão quando um método é chamado,
// então importar aqui não conecta nada e mantém o build do Next feliz).
import { fileStore } from "./fileStore.mjs";
import { mongoStore } from "./mongo.mjs";

function impl() {
  return process.env.MONGODB_URI ? mongoStore : fileStore;
}

export async function getAll(filter) {
  return impl().getAll(filter);
}
export async function upsertMany(vagas) {
  return impl().upsertMany(vagas);
}
export async function updateStatus(id, status) {
  return impl().updateStatus(id, status);
}
export function backendName() {
  return process.env.MONGODB_URI ? "MongoDB" : "arquivo local";
}
