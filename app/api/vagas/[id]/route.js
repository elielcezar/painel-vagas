import { NextResponse } from "next/server";
import { updateStatus } from "../../../../lib/store.mjs";

export const dynamic = "force-dynamic";

const VALIDOS = new Set(["novo", "enviado", "dispensado"]);

// PATCH /api/vagas/:id  body: { status: "enviado" | "dispensado" | "novo" }
export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json();
    if (!VALIDOS.has(status)) {
      return NextResponse.json({ error: "status inválido" }, { status: 400 });
    }
    const ok = await updateStatus(decodeURIComponent(params.id), status);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
