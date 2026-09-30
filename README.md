# Busca de vagas & Currículos — Eliel Cezar

Guia rápido do projeto: uma rotina para **buscar e triar vagas/freelas** e um gerador de **currículos** em duas versões (ATS e visual).

> A IA **não se candidata a nada** — só pesquisa, lê e sugere. O envio é sempre manual.

---

## 🌙 Rotina noturna de busca

Com o **Chrome aberto e logado** (LinkedIn/Gupy) e o Claude in Chrome conectado, é só pedir:

> **"busca noturna"**  (ou "rodar a busca de vagas")

O que acontece automaticamente:
1. Busca em **LinkedIn, Gupy e Workana** (abas novas, sem mexer nas suas).
2. Triagem de cada item: frente, tipo (vaga/freela), nota 0–10, alertas, currículo sugerido.
3. Salva o resultado do dia em **`resultados/AAAAMMDD.html`** (abre no navegador).
4. Atualiza a página online (Artifact) no **mesmo link** de sempre — mostrando **só os resultados daquela noite** (substitui, não acumula; o histórico fica nos arquivos `resultados/`).
5. Resumo no chat com os destaques e o que mudou desde a noite anterior.

**Importante:** a busca precisa do seu login no Chrome, então **não roda sozinha de madrugada**. O fluxo é: antes de dormir você dispara, ela roda em alguns minutos e publica; de manhã você abre pronto.

Página online (link fixo):
`https://claude.ai/code/artifact/9f2f062f-dd7c-45d9-99df-2d7300860985`

Filtros na página: **frente** (Front-end / UI/UX / Híbrida), **tipo** (vaga / freela) e **nota mínima**.

---

## 📄 Currículos

Todos saem de **uma fonte de dados só**: o objeto `VERSOES` em `gerador/gerar.js`
(mais `CONTATO`, `FORMACAO`, `IDIOMAS`). **Regra de ouro: nunca inventar experiência** —
usar só o que está ali. Dos mesmos dados saem dois formatos:

| Formato | Comando | Onde | Quando usar |
|---|---|---|---|
| **ATS** (`.docx`) | `node gerar.js` | raiz do projeto | Candidaturas (Gupy, LinkedIn, qualquer ATS) |
| **Visual** (`.html`) | `node gerar-visual.js` | `curriculo/` | Envio direto para pessoas, portfólio, PDF |

### Gerar / atualizar tudo
```bash
cd gerador
node gerar.js          # gera os .docx (ATS)
node gerar-visual.js   # gera os .html visuais
```

### Gerar o PDF
Abra o arquivo `curriculo/<nome>-visual.html` no navegador e clique em
**"Imprimir / Salvar em PDF"** (ou Ctrl+P → Salvar como PDF).

### Criar uma versão personalizada para uma vaga
No `gerador/gerar.js`, adicione ao final (reaproveitando as experiências reais de uma base):
```js
VERSOES["Eliel-Cezar-NomeDaEmpresa"] = {
  cargo: "Cargo  |  Palavras-chave da vaga",
  kicker: "Texto do topo (só no visual)",     // opcional
  role: "Frase abaixo do nome (só no visual)", // opcional
  resumo: "Resumo ajustado à vaga...",
  competencias: [ ["Rótulo", "itens..."], /* ... */ ],
  experiencias: VERSOES["Eliel-Cezar-Front-end"].experiencias, // ou -UI-UX / -Hibrido
};
```
Depois rode os dois geradores. Saem o `.docx` e o `.html` da nova versão.

### Versões atuais
- **Base:** `Eliel-Cezar-Front-end`, `Eliel-Cezar-UI-UX`, `Eliel-Cezar-Hibrido`
- **Personalizadas:** `Eliel-Cezar-Sympla-Frontend`, `Eliel-Cezar-Avenue-UIUX`, `Eliel-Cezar-ERP-DesignEngineer`

---

## 📁 Estrutura

```
curriculos/
├─ CLAUDE.md                     # instruções para a IA (runbook detalhado)
├─ README.md                     # este arquivo
├─ Eliel-Cezar-*.docx            # currículos ATS (gerados)
├─ gerador/
│  ├─ gerar.js                   # dados + geração dos .docx (ATS)
│  └─ gerar-visual.js            # geração dos .html visuais (template)
├─ curriculo/
│  └─ Eliel-Cezar-*-visual.html  # currículos visuais (gerados)
├─ resultados/
│  └─ AAAAMMDD.html              # resultado de cada busca noturna
└─ vagas/
   └─ coletar_gupy.py            # coletor via API da Gupy (alternativa; não usado)
```

---

## ✅ Regras que valem lembrar
- **Não inventar experiência** nos currículos — só o que está no `gerador`.
- **Testes automatizados** (Jest/RTL/Cypress) estão **em aprendizado** — aparecem marcados assim.
- **ATS para candidatura, visual para humano.** O `.docx` simples é lido melhor pelos
  sistemas de recrutamento (uma coluna, sem tabela/imagem, texto selecionável); o visual
  é para impressionar quem vai olhar de perto.
- **Só Brasil por enquanto:** remoto no Brasil ou híbrido/presencial em Curitiba/PR.
  Níveis Pleno, Sênior, Tech Lead/Staff (sem estágio/júnior/trainee).
- **Inclui agências de publicidade**, não só empresas de tech — a busca tem uma frente
  específica de Curitiba (presencial + híbrido) e títulos de agência (Webdesigner,
  Desenvolvedor Web/WordPress), que as buscas remotas deixavam de fora.
