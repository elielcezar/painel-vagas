"use client";

import { useEffect, useMemo, useState } from "react";

const FRENTE = {
  "Front-end": { c: "var(--fe)", s: "var(--fe-soft)" },
  "UI/UX": { c: "var(--ux)", s: "var(--ux-soft)" },
  "Híbrida": { c: "var(--hy)", s: "var(--hy-soft)" },
};
const notaVars = (n) =>
  n >= 8 ? { c: "var(--good)", s: "var(--good-soft)" } : n >= 6 ? { c: "var(--mid)", s: "var(--mid-soft)" } : { c: "var(--low)", s: "var(--low-soft)" };

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconExt = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
);
const IconWarn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

export default function Home() {
  const [vagas, setVagas] = useState([]);
  const [backend, setBackend] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("inbox"); // inbox | arquivo
  const [frente, setFrente] = useState("all");
  const [min, setMin] = useState(0);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/vagas", { cache: "no-store" });
      const data = await r.json();
      setVagas(data.vagas || []);
      setBackend(data.backend || "");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  async function setStatus(id, status) {
    // otimista
    setVagas((prev) => prev.map((v) => (v._id === id ? { ...v, status } : v)));
    await fetch(`/api/vagas/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function copyCmd() {
    navigator.clipboard?.writeText("busca noturna").then(
      () => flash('Comando "busca noturna" copiado — cole no chat do Claude.'),
      () => flash('Diga "busca noturna" ao Claude para atualizar.')
    );
  }

  const counts = useMemo(() => {
    let inbox = 0, arquivo = 0;
    for (const v of vagas) (v.status === "novo" ? inbox++ : arquivo++);
    return { inbox, arquivo };
  }, [vagas]);

  const lista = useMemo(() => {
    const term = q.trim().toLowerCase();
    return vagas
      .filter((v) => (view === "inbox" ? v.status === "novo" : v.status !== "novo"))
      .filter((v) => frente === "all" || v.frente === frente)
      .filter((v) => (v.nota ?? 0) >= min)
      .filter((v) => !term || `${v.titulo} ${v.empresa} ${v.local || ""}`.toLowerCase().includes(term))
      .sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0));
  }, [vagas, view, frente, min, q]);

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand">
            <span className="s">Painel de vagas</span>
            <span className="t">Eliel Cezar</span>
          </div>
          <div className="search">
            <IconSearch />
            <input
              type="search"
              placeholder="Buscar nas vagas coletadas (título, empresa, local)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="run">
            <button className="run-btn" onClick={copyCmd}>⚡ Rodar busca</button>
            <span className="run-hint">Copia o comando <b>busca noturna</b> — cole no chat do Claude para coletar novas vagas.</span>
          </div>
        </div>
      </header>

      <main className="wrap">
        <div className="controls">
          <div className="tabs" role="tablist">
            <button className="tab" role="tab" aria-selected={view === "inbox"} onClick={() => setView("inbox")}>
              Início <span className="badge">{counts.inbox}</span>
            </button>
            <button className="tab" role="tab" aria-selected={view === "arquivo"} onClick={() => setView("arquivo")}>
              Arquivo <span className="badge">{counts.arquivo}</span>
            </button>
          </div>

          <div className="fgroup">
            <span>Frente</span>
            <div className="chips">
              {["all", "Front-end", "UI/UX", "Híbrida"].map((f) => (
                <button key={f} className="chip" aria-pressed={frente === f} onClick={() => setFrente(f)}>
                  {f === "all" ? "Todas" : f}
                </button>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <span>Nota mínima</span>
            <div className="chips">
              {[0, 6, 7, 8].map((m) => (
                <button key={m} className="chip" aria-pressed={min === m} onClick={() => setMin(m)}>
                  {m === 0 ? "Todas" : `≥ ${m}`}
                </button>
              ))}
            </div>
          </div>

          <p className="count">{loading ? "carregando…" : <><b>{lista.length}</b> {view === "inbox" ? "no início" : "no arquivo"}</>}</p>
        </div>

        {backend && backend !== "MongoDB" && (
          <p className="banner">
            Usando <b>armazenamento local</b> (arquivo). Para ligar o seu MongoDB Atlas, crie <code>.env.local</code> com <code>MONGODB_URI</code> e reinicie.
          </p>
        )}

        <div className="grid">
          {!loading && lista.length === 0 && (
            <div className="empty">
              <div className="big">{view === "inbox" ? "Nada por aqui." : "Arquivo vazio."}</div>
              {view === "inbox"
                ? <>Rode a <b>busca noturna</b> para coletar novas vagas, ou ajuste os filtros.</>
                : <>Vagas que você marcar como enviadas ou dispensar aparecem aqui.</>}
            </div>
          )}

          {lista.map((v) => {
            const fv = FRENTE[v.frente] || { c: "var(--line)", s: "var(--surface-2)" };
            const nv = notaVars(v.nota ?? 0);
            const style = { "--frente-color": fv.c, "--frente-soft": fv.s, "--nota-color": nv.c, "--nota-soft": nv.s };
            return (
              <article className="card" key={v._id} style={style}>
                <div className="card-top">
                  <div>
                    <div className="badges">
                      <span className="frente">{v.frente}</span>
                      {v.status === "enviado" && <span className="status-pill st-enviado">CV enviado</span>}
                      {v.status === "dispensado" && <span className="status-pill st-dispensado">Dispensada</span>}
                    </div>
                    <h3 className="title">{v.titulo}</h3>
                    <p className="meta"><span className="co">{v.empresa}</span>{v.local ? <><span className="sep">·</span>{v.local}</> : null}</p>
                  </div>
                  <div className="nota"><div className="val">{v.nota ?? "–"}</div><div className="max">/ 10</div></div>
                </div>

                {v.motivo && <p className="motivo">{v.motivo}</p>}

                {Array.isArray(v.alertas) && v.alertas.length > 0 && (
                  <div className="alerts">
                    {v.alertas.map((a, i) => (
                      <div className="alert" key={i}><IconWarn /><span>{a}</span></div>
                    ))}
                  </div>
                )}

                {v.cvFile && (
                  <p className="cv">Currículo: <b>{v.cv}</b> <span className="file">{v.cvFile}</span></p>
                )}

                <div className="foot">
                  <div className="foot-row">
                    <span className="src">{v.fonte}</span>
                    {v.link && <a className="link" href={v.link} target="_blank" rel="noopener noreferrer">Ver vaga <IconExt /></a>}
                  </div>

                  {view === "inbox" ? (
                    <div className="actions">
                      <button className="act enviar" onClick={() => setStatus(v._id, "enviado")}>✓ CV Enviado</button>
                      <button className="act dispensar" onClick={() => setStatus(v._id, "dispensado")}>✕ Dispensar</button>
                    </div>
                  ) : (
                    <div className="actions">
                      <button className="act voltar" onClick={() => setStatus(v._id, "novo")}>↩ Voltar para Início</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
