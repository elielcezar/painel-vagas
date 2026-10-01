// ---------- Identidade da vaga (dedup garantido por código, não pela coleta) ----------

const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// Chave de conteúdo: mesma empresa + mesmo título = mesma vaga (pega republicação com
// outro ID no LinkedIn e a mesma vaga vinda de fontes diferentes).
export function chaveVaga(v) {
  const e = norm(v.empresa);
  const t = norm(v.titulo);
  return e && t ? `${e}|${t}` : null;
}

// ID canônico extraído do LINK (ignora o _id que veio no JSON quando o link permite).
export function idCanonico(v) {
  const link = String(v.link || "");
  let m = link.match(/linkedin\.com\/jobs\/view\/(\d+)/i);
  if (m) return `linkedin:${m[1]}`;
  m = link.match(/gupy\.io\/job\/([A-Za-z0-9+/=_-]+)/i);
  if (m) {
    try {
      const j = JSON.parse(Buffer.from(m[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
      if (j.jobId) return `gupy:${j.jobId}`;
    } catch { /* link fora do padrão: segue para os fallbacks */ }
  }
  m = link.match(/workana\.com\/job\/([a-z0-9-]+)/i);
  if (m) return `workana:${m[1]}`;
  if (v._id) return v._id;
  const k = chaveVaga(v);
  return k ? `${norm(v.fonte) || "vaga"}:${k.replace(/[| ]+/g, "-")}` : null;
}

// Para cada vaga recebida, decide em qual documento existente ela cai (ou se é nova).
// `index` = { byId: Map, byChave: Map } montado a partir do que já está gravado e
// atualizado durante o import (também elimina repetidas dentro do mesmo arquivo).
export function montarIndice(docs) {
  const byId = new Map();
  const byChave = new Map();
  for (const d of docs) indexar({ byId, byChave }, d);
  return { byId, byChave };
}
export function indexar(index, d) {
  for (const id of d.ids || [d._id]) index.byId.set(id, d);
  index.byId.set(d._id, d);
  const k = d.chave || chaveVaga(d);
  if (k) index.byChave.set(k, d); // sempre aponta para a versão mais recente do documento
}
export function resolver(index, v, now) {
  const id = idCanonico(v);
  const chave = chaveVaga(v);
  const existing = (id && index.byId.get(id)) || (chave && index.byChave.get(chave)) || null;
  const _id = existing ? existing._id : id;
  const doc = mergeVaga(existing, { ...v, _id }, now);
  doc.chave = chave || existing?.chave || null;
  doc.ids = [...new Set([...(existing?.ids || (existing ? [existing._id] : [])), id].filter(Boolean))];
  return { doc, existing };
}

// Regra única de mesclagem de uma vaga importada com a que já existe no banco.
// - status, statusAt, firstSeen e coletadaEm: a PRIMEIRA observação vence (nunca são sobrescritos).
// - postadaEm: preenche se faltar; uma data EXATA substitui uma ESTIMADA; uma estimada nunca
//   substitui outra já gravada (evita a data "andar" a cada noite com "há 2 semanas").
// - demais campos (título, nota, motivo, alertas…): o import mais recente atualiza.
export function mergeVaga(existing, incoming, now = new Date().toISOString()) {
  const { status, statusAt, firstSeen, lastSeen, coletadaEm, postadaEm, postadaAprox, ...rest } = incoming;
  const ex = existing || {};

  const coleta = ex.coletadaEm || ex.firstSeen || coletadaEm || now;

  const doc = {
    ...ex,
    ...rest,
    status: ex.status || status || "novo",
    firstSeen: ex.firstSeen || coleta,
    coletadaEm: coleta,
    lastSeen: now,
  };
  if (ex.statusAt) doc.statusAt = ex.statusAt;

  const exatoSubstituiEstimado = ex.postadaAprox && postadaAprox === false;
  if (postadaEm && (!ex.postadaEm || exatoSubstituiEstimado)) {
    doc.postadaEm = postadaEm;
    doc.postadaAprox = Boolean(postadaAprox);
  }
  return doc;
}
