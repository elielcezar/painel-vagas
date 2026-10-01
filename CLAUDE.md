# Busca de vagas – Eliel Cezar

Projeto de **busca e triagem de vagas** com um **painel** (Next.js + MongoDB) onde as vagas
acumulam, são triadas e arquivadas. **A IA não se candidata a nada**: só pesquisa, lê e sugere.
O envio é sempre manual, feito pelo Eliel.

> A geração de currículos foi movida para um **projeto separado**. Aqui é só busca + painel.

## Rotina noturna (o gatilho)

O Eliel roda a busca **toda noite** com o Chrome aberto e logado. Para disparar, ele diz
**“busca noturna”** (ou “rodar a busca de vagas”). Ao ver o gatilho, execute de ponta a ponta,
sem ficar perguntando (só pare se algo bloquear, ex.: Chrome desconectado ou login caído):

1. **Carregar as ferramentas do Claude in Chrome** e pegar o contexto das abas. Abrir **abas novas**, nunca mexer nas dele.
2. **Rodar as buscas** da “Receita de busca” abaixo (LinkedIn, Gupy, Workana) — **incluindo a frente Agências / Curitiba** (presencial + híbrido), não só tech remoto.
3. **Triar** cada item (ver “Triagem”). Ler a descrição completa das mais promissoras; para o resto, triagem preliminar por card.
4. **Gravar no painel:** escrever as vagas de hoje em `entradas/AAAAMMDD.json` (schema abaixo) e importar:
   ```bash
   npm run importar -- entradas/AAAAMMDD.json
   ```
   O import faz **upsert por `_id`**: vagas novas entram como `novo`; as que já existem têm os dados atualizados **sem perder o status** (`enviado`/`dispensado`) que o Eliel já deu. **Sem dedup manual** — o banco cuida; a aba “Início” do painel mostra só o que falta tratar.
5. **Avisar para abrir o painel:** `npm run dev` → http://localhost:3000. Novas em **Início**; ele usa **CV Enviado** / **Dispensar** (vão para **Arquivo**).
6. **Resumir no chat:** quantas vagas novas entraram, destaques e alertas fortes (inglês, PcD, modelo de trabalho, nível/faixa).

> **Limite honesto:** a busca precisa do Chrome logado com a conta dele, então **não roda por cron sem supervisão** (agente na nuvem não tem o login do LinkedIn/Gupy). Ele dispara à noite, a rodada coleta/tria e importa no painel; de manhã ele revisa.

### Schema da entrada (`entradas/AAAAMMDD.json`)
Array de objetos. `frente` deve ser exatamente **Front-end**, **UI/UX** ou **Híbrida**.

**Dedup é garantido pelo código (`lib/merge.mjs`), não pela coleta.** Basta mandar `link`, `empresa` e `titulo` fiéis à fonte:
- O importador **calcula o `_id` a partir do link** (`linkedin:<id>` de `/jobs/view/<id>/`, `gupy:<jobId>` decodificando a URL da Gupy, `workana:<slug>`); o `_id` do JSON só é usado se o link não tiver padrão conhecido.
- Além do ID, compara uma **chave empresa + título normalizados** (sem acento/caixa/pontuação) com tudo que já está no banco. Se bater, a vaga é mesclada na existente (mantém status e datas), e o novo ID entra em `ids`. Isso pega **republicação com outro ID** e **a mesma vaga em fontes diferentes**, inclusive repetidas dentro do mesmo arquivo.
- Limite conhecido: duas vagas **diferentes** com empresa e título idênticos seriam tratadas como uma.
```json
{ "_id": "linkedin:4466160189", "fonte": "LinkedIn",
  "titulo": "…", "empresa": "…", "local": "Brasil · Remoto",
  "frente": "Front-end", "nota": 9, "motivo": "…", "alertas": ["…"],
  "postadaEm": "2026-09-23", "postadaAprox": true,
  "coletadaEm": "2026-09-30T23:15:00.000Z",
  "link": "https://www.linkedin.com/jobs/view/4466160189/" }
```
- **`coletadaEm`** (ISO com hora, UTC): momento da coleta — use o horário da rodada. No banco, a **primeira** coleta vence (reimportar não altera).
- **`postadaEm`** (`AAAA-MM-DD`, data local de Brasília) + **`postadaAprox`** (bool): quando a vaga foi publicada no site. Sempre preencher quando a fonte mostrar algo:
  - **LinkedIn:** a página logada **não tem data exata** (sem JSON-LD/`<time>`), só o relativo do topo do card (“2 weeks ago”, “Reposted 1 week ago”, “há 3 dias”). Calcular `coletadaEm − intervalo` → `postadaAprox: true`. “Reposted” = data do repost.
  - **Gupy:** “Publicada em: DD/MM/AAAA” → data exata, `postadaAprox: false`.
  - **Workana:** “Publicado: há X horas/dias” → estimada, `postadaAprox: true`.
- No banco, uma data **exata** substitui uma estimada; uma estimada nunca substitui outra já gravada (regra em `lib/merge.mjs`).
- O card mostra “Postada ~23/09/2026” (o `~` indica estimada) e “Coletada 30/09/2026 às 20:15”.

### Receita de busca (URLs prontas)
LinkedIn — filtros: `f_WT=2` (remoto), `f_E=3,4,5` (pleno/sênior/diretor; exclui estágio e júnior):
- Front-end: `https://www.linkedin.com/jobs/search/?keywords=Desenvolvedor%20Front-end&location=Brasil&f_WT=2&f_E=3%2C4%2C5`
- React remoto: `https://www.linkedin.com/jobs/search/?keywords=Front-end%20React&location=Brasil&f_WT=2&f_E=3%2C4%2C5&sortBy=DD`
- UI/UX: `https://www.linkedin.com/jobs/search/?keywords=Product%20Designer&location=Brasil&f_WT=2&f_E=3%2C4%2C5`

Gupy: `https://portal.gupy.io/job-search/term=front-end` e `.../term=product%20designer`.

Workana (público, sem login; **não** aceitar cookies): `https://www.workana.com/jobs?language=pt&query=front-end`, `...&category=design-multimedia&query=UI%20UX`, `...&category=design-multimedia&query=aplicativo%20mobile`.

> **99Freelas foi removida** (qualidade baixa, trabalhos por ~R$50). Não incluir.

**Frente Agências / Curitiba (presencial + híbrido).** As buscas remotas quase não trazem agência — elas contratam sobretudo **presencial/híbrido em Curitiba** e usam **outros títulos**. Rodar também (LinkedIn, `f_WT=1,2,3`, `location=Curitiba`):
- Front-end: `https://www.linkedin.com/jobs/search/?keywords=Front-end&location=Curitiba%2C%20Paran%C3%A1%2C%20Brasil&f_WT=1%2C2%2C3&f_E=3%2C4%2C5`
- Webdesigner / Desenvolvedor Web / WordPress / Designer: mesmas URLs trocando `keywords=`.
- Aplicar o filtro de **setor = “Serviços de publicidade / Marketing”** (via “Todos os filtros” → Setor) para isolar agências. Títulos típicos: Webdesigner, Desenvolvedor Web/WordPress, Analista Front-end, Desenvolvedor Criativo.
- No card, marcar essas como origem **Agência · Curitiba**. O Eliel já atua em agência (Megamidia) — terreno natural.

Dicas: `get_page_text` no card selecionado do LinkedIn traz a descrição inteira; `read_page filter=interactive` dá os links (`/jobs/view/<id>/`).

## Perfil
- Duas frentes: **Front-end** (React, Next.js, Tailwind, Vue, Node, WordPress/Drupal; Tech Lead de 5 devs na Megamidia desde 2016) e **UI/UX** (graduação em Design Gráfico e pós com foco em UX, ambas na UTFPR; Figma).
- Vagas **híbridas** (Design Engineer, UI Engineer, Product Designer que codifica) são o ponto forte — mas raras como cargo no Brasil; aparecem dentro de front-end com Design System.
- Inglês e espanhol intermediários. **Testes automatizados (Jest/RTL/Cypress): em aprendizado.**

## Preferências de busca
- **Somente Brasil por enquanto.** Remoto no Brasil OU híbrido/presencial na região de Curitiba/PR.
- Níveis: Pleno, Sênior, Tech Lead/Staff. Excluir estágio, júnior e trainee.
- **Incluir agências de publicidade** (não só tech) — ver a frente “Agências / Curitiba”.
- Fontes: **LinkedIn, Gupy e Workana**, pelo Claude in Chrome, com o login do Eliel (Workana é pública).

## Triagem (para cada vaga)
- Frente: Front-end, UI/UX ou Híbrida.
- Compatibilidade de 0 a 10, com o motivo.
- Alertas: inglês fluente obrigatório, tecnologia que ele não domina, modelo de trabalho incompatível, vaga exclusiva PcD, PJ, nível abaixo do perfil.
- Data de publicação (`postadaEm`/`postadaAprox`) e de coleta (`coletadaEm`).

## O painel (este projeto)
App Next.js na **raiz** do projeto (não há mais subpasta `painel/`).
- **Rodar:** `npm run dev` → http://localhost:3000.
- **Dados:** MongoDB Atlas se houver `MONGODB_URI` em `.env.local`; senão, arquivo local `data/vagas.json` (a partir de `data/vagas.seed.json`).
- **Estrutura:** `app/` (UI + API routes), `lib/` (camada de dados: `store`/`mongo`/`fileStore`), `scripts/importar.mjs`, `entradas/` (JSONs diários, um por noite, mantidos como histórico).
- **API:** `GET /api/vagas` (lista), `POST /api/vagas` (upsert), `PATCH /api/vagas/:id` (status).
- Detalhes de configuração no `README.md`.
