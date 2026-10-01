# Busca de vagas & Painel — Eliel Cezar

Rotina para **buscar e triar vagas** + um **painel** (Next.js + MongoDB) onde elas acumulam,
são triadas e arquivadas.

> A IA **não se candidata a nada** — só pesquisa, lê e sugere. O envio é sempre manual.
> O gerador de currículos fica em um **projeto separado**.

---

## 🌙 Rotina noturna

Com o **Chrome aberto e logado** (LinkedIn/Gupy) e o Claude in Chrome conectado, peça:

> **"busca noturna"**

O que acontece:
1. Busca em **LinkedIn, Gupy e Workana** (abas novas), incluindo a frente **Agências / Curitiba** (presencial + híbrido).
2. Triagem: frente, nota 0–10, alertas, currículo sugerido.
3. As vagas do dia são gravadas em `entradas/AAAAMMDD.json` e **importadas no painel** (`npm run importar`).
4. Resumo no chat com destaques e quantas vagas novas entraram.

A busca precisa do seu login no Chrome, então **não roda sozinha de madrugada**: você dispara à noite, ela coleta/importa, e de manhã você revisa no painel.

---

## 📊 Painel

```bash
npm install       # primeira vez
npm run dev       # abre em http://localhost:3000
```

- **Início:** vagas novas. Botões **CV Enviado** / **Dispensar** → mandam a vaga para o **Arquivo**.
- **Arquivo:** enviadas/dispensadas (com **↩ Voltar para Início**).
- **Busca** por texto no header + filtros de **frente** e **nota**.
- **Dedup automático:** cada vaga tem `_id` estável; reimportar não duplica e mantém o status.

### MongoDB
Sem configuração, o painel usa um **arquivo local** (`data/vagas.json`, a partir de `data/vagas.seed.json`) — dá pra testar na hora.

Para ligar o **MongoDB Atlas**:
1. Copie `.env.local.example` → `.env.local`.
2. Cole a connection string em `MONGODB_URI` (contém usuário/senha — **não** compartilhe; fica fora do git).
3. Reinicie o `npm run dev`.

Testar a conexão importando o seed:
```bash
npm run importar -- data/vagas.seed.json     # deve mostrar "Backend: MongoDB"
```

### Alimentar o painel (formato da entrada)
`entradas/AAAAMMDD.json` — array de vagas. `_id = "<fonte>:<jobId>"` (chave de dedup):
```json
{ "_id": "linkedin:4466160189", "fonte": "LinkedIn",
  "titulo": "…", "empresa": "…", "local": "Brasil · Remoto",
  "frente": "Front-end", "nota": 9, "motivo": "…", "alertas": ["…"],
  "postada": "há 2 dias",
  "link": "https://www.linkedin.com/jobs/view/4466160189/" }
```
`postada` é opcional (quando a fonte mostra a data de publicação). A data/hora de **coleta** é gravada automaticamente no import (`firstSeen`).
```bash
npm run importar -- entradas/AAAAMMDD.json
```

### API
- `GET /api/vagas` — lista todas.
- `POST /api/vagas` — importa/upsert (`{ vagas: [...] }`).
- `PATCH /api/vagas/:id` — muda status (`{ "status": "enviado" | "dispensado" | "novo" }`).

---

## 📁 Estrutura

```
.
├─ CLAUDE.md            # runbook da busca noturna + painel (para a IA)
├─ README.md            # este guia
├─ app/                 # UI (page.jsx) + API routes (app/api/vagas)
├─ lib/                 # camada de dados: store / mongo / fileStore
├─ scripts/importar.mjs # importador (usado pela busca noturna)
├─ data/                # vagas.seed.json (exemplo) e vagas.json (local, fora do git)
├─ entradas/            # AAAAMMDD.json — vagas coletadas por noite (histórico)
└─ .env.local           # MONGODB_URI (fora do git)
```

---

## ✅ Regras
- **Só Brasil por enquanto:** remoto no Brasil ou híbrido/presencial em Curitiba/PR. Níveis Pleno/Sênior/Tech Lead (sem estágio/júnior/trainee).
- **Inclui agências de publicidade**, não só tech (frente Curitiba presencial+híbrido).
- **99Freelas descartada** (qualidade baixa).
