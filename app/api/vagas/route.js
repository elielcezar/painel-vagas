import { NextResponse } from "next/server";
import { getAll, upsertMany, backendName } from "../../../lib/store.mjs";

export const dynamic = "force-dynamic";

// GET /api/vagas  -> todas as vagas (o filtro por aba/frente/busca é feito no cliente)
export async function GET() {
  try {
    const vagas = await getAll();
    return NextResponse.json({ vagas, backend: backendName() });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

// POST /api/vagas  -> importa (upsert) um array de vagas; usado pela "busca noturna"
// body: { vagas: [...] }  ou  [...]
export async function POST(req) {
  try {
    const body = await req.json();
    const vagas = Array.isArray(body) ? body : body.vagas || [];
    const r = await upsertMany(vagas);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
