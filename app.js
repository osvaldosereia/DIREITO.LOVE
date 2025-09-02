// ================================
// app.js - direito.love (UX refinada)
// ================================

// Seletores principais
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const drawer = document.getElementById("settings-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-settings");
const settingsBtn = document.querySelector(".settings-btn");

// ================================
// Snackbar (toast moderno)
// ================================
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;

  toast.classList.remove("show");
  clearTimeout(toastTimeout);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  const duracao = message.length > 40 ? 3500 : 1800;
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duracao);
}

// ================================
// Objetivos fixos (padrão)
// ================================
const opcoesEstudo = [
  {
    nome: "Explicação Detalhada",
    prompt: `Você é um professor universitário didático e objetivo. Escreva em **português‑BR**, usando **Markdown**.

TEMA: "{tema}"

OBJETIVO: entregar um material **memorável, detalhado e confiável**, com foco em estudantes.

REGRAS DE QUALIDADE (siga à risca):
- Seja claro no conceito inicial (1 parágrafo), depois **aprofundado e organizado**.
- **Sem floreios**, **sem links diretos**. **Não invente números de processos**. Se houver incerteza, diga “não há consenso”.
- Baseie-se em **entendimento majoritário**. Cite **artigos e leis por número/nome** (sem URL).
- Se o tema **não for jurídico**, adapte “Base legal/Jurisprudência” para **Teoria/Autores/Estudos** da área.

ESTRUTURA OBRIGATÓRIA:
1) **Conceito em 5 linhas** (direto ao ponto).
2) **Mapa da matéria** (tópicos principais com 1–2 frases cada).
3) **Base legal essencial** (artigos, leis, súmulas/enunciados — só números e nomes).
4) **Doutrina** (teses/correntes + autores/obras de referência em 3–5 bullets).
5) **Jurisprudência majoritária (STJ/STF)**: tese(s) consolidada(s) em bullets; indique se há divergência.
6) **Prática forense**: competência, legitimidade, pedidos, tutelas, ônus da prova, prazos e recursos.
7) **Exemplos práticos**: 3–5 mini‑casos resolvidos (passo a passo).
8) **Quadro comparativo** (tema vs institutos próximos) em tabela simples.
9) **Erros comuns & dicas de prova** (lista objetiva).
10) **Relação processual**: provas úteis, estratégia e riscos.
11) **Conclusões de bolso**: 5 bullets que “ficam na cabeça”.
12) **🔎 Buscas prontas** (somente buscas do Google, **sem citar sites**):
   - Notícias recentes → https://www.google.com/search?q={tema}+notícias
   - Casos famosos → https://www.google.com/search?q={tema}+casos+famosos
   - Jurisprudência → https://www.google.com/search?q={tema}+jurisprudência
   - Acórdãos → https://www.google.com/search?q={tema}+acórdãos
   - Súmulas → https://www.google.com/search?q={tema}+súmulas
   - Enunciados → https://www.google.com/search?q={tema}+enunciados
   - Artigos doutrinários → https://www.google.com/search?q={tema}+artigo+doutrinário
   - Decisões de tribunais → https://www.google.com/search?q={tema}+decisões+tribunais
   - Críticas jurídicas → https://www.google.com/search?q={tema}+críticas+jurídicas
   - Debates atuais → https://www.google.com/search?q={tema}+debates+atuais
13) **5 temas correlatos** (lista numerada).

Finalize com: **💚 direito.love**  \n**Gere um novo prompt em direito.love**`
  },
  {
    nome: "Questões Objetivas",
    prompt: `Elabore **10 questões objetivas** sobre "{tema}" com alternativas **A–D**. Escreva em **português‑BR** e formate em **Markdown**.

REGRAS:
- Enunciados claros, variando nível (fácil→difícil). Uma única correta por questão.
- Inclua itens que testem: conceitos, exceções, prazos, competência, ônus da prova e **jurisprudência majoritária**.
- Nas alternativas, evite pistas óbvias e use **distratores plausíveis**.
- **Não cite números de processos**. Se citar lei, traga **artigo + nome da lei** (sem links).

FORMATO:
**Questão 1**  
A) …  
B) …  
C) …  
D) …

(Repita até a 10)

**Gabarito comentado (no final, sem spoiler antes)**  
1) Letra X — comentário sucinto (2–3 linhas) explicando por que está correta e por que as outras não.

Após o gabarito, escreva:  
**“Quer mais 10? (responda: Sim / Não)”**  
e liste **5 temas correlatos**.

Finalize com: **💚 direito.love**  \n**Gere um novo prompt em direito.love**`
  },
  {
    nome: "Revisão Rápida",
    prompt: `Produza uma **Revisão Rápida** de **1 página** sobre "{tema}" em **português‑BR**, formato **Markdown**, estilo checklist (objetivo, porém abrangente).

ITENS OBRIGATÓRIOS:
- **Essência do tema**: 5 bullets.
- **Requisitos/Elementos**: checklist com caixas [ ].
- **Exceções e pegadinhas**: 6–8 bullets.
- **Prazos & Competência** (se jurídico): tabela curta \`Item | Prazo/Competência | Observação\`.
- **Artigos-chave / Súmulas/Enunciados**: lista com **número + nome**, sem links.
- **Jurisprudência majoritária**: 3–5 entendimentos em 1 linha cada.
- **Fluxo prático em 6 passos** (setas “→”).
- **Mnemônicos (3–5)**.
- **Perguntas‑relâmpago (5)** com respostas breves logo abaixo.
- **Resumo em 5 linhas**.

Finalize com: **💚 direito.love**  \n**Gere um novo prompt em direito.love**`
  },
  {
    nome: "Pegadinhas de Prova",
    prompt: `Liste **12–18 pegadinhas de prova** sobre "{tema}" em **português‑BR**, usando **Markdown**.

FORMATO OBRIGATÓRIO (uma por linha):
**Pegadinha:** (afirmativa enganosa do jeito que cai)  
**Correção:** (a forma correta) — **Por quê:** (regra/entendimento)  
**Base:** (artigo/lei/súmula/enunciado — só número e nome; sem links)

DEPOIS:
- **Mini‑simulado V/F (3 itens)** com gabarito ao final.
- **Anti‑pegadinhas**: 6 dicas práticas para não errar.
- **Comparativos relâmpago** (3 pares que geram confusão) em tabela curta.

Não invente números de processos. Use **jurisprudência majoritária** quando necessário.

Finalize com: **💚 direito.love**  \n**Gere um novo prompt em direito.love**`
  },
  {
    nome: "Casos Concretos",
    prompt: `Crie **5 casos concretos comentados** sobre "{tema}" em **português‑BR**, formato **Markdown**.

PARA CADA CASO, ENTREGUE:
- **Contexto (story realista)** em 4–6 linhas.
- **Perguntas do examinador** (2–3).
- **Solução passo a passo** (do problema à conclusão).
- **Base legal**: artigos/leis/súmulas/enunciados relevantes (número + nome; sem links).
- **Jurisprudência majoritária**: entendimento aplicável em 1–2 linhas (sem inventar números).
- **Estratégia prática**: pedidos cabíveis, provas úteis, riscos e recursos.
- **Erros comuns** e **variações do caso** (como mudaria se X/Y).

NO FINAL:
**🔎 Buscas prontas** (apenas Google, sem citar sites):  
- https://www.google.com/search?q={tema}+casos+concretos  
- https://www.google.com/search?q={tema}+jurisprudência  
- https://www.google.com/search?q={tema}+acórdãos  
- https://www.google.com/search?q={tema}+súmulas  
- https://www.google.com/search?q={tema}+enunciados  
- https://www.google.com/search?q={tema}+artigos+doutrinários  
- https://www.google.com/search?q={tema}+decisões+tribunais  
- https://www.google.com/search?q={tema}+críticas+jurídicas  
- https://www.google.com/search?q={tema}+debates+atuais  
- https://www.google.com/search?q={tema}+modelos+peças

Acrescente **5 temas correlatos**.

Finalize com: **💚 direito.love**  \n**Gere um novo prompt em direito.love**`
  }
];


let temaAtual = "";

// Scroll automático
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ================================
// Envio do tema
// ================================
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const tema = chatInput.value.trim();
  if (!tema) {
    showToast("⚠️ Digite um tema antes de enviar!");
    return;
  }

  addMessage("user", tema);

  const typingMsg = addMessage("bot", "digitando...");

  setTimeout(() => {
    typingMsg.textContent = "Pronto! Já gerei 5 opções de estudo. Escolha a que quiser copiar:";
    renderOpcoes(tema);
  }, 1000);

  chatInput.value = "";
});

// ================================
// Renderizar botões de opções
// ================================
function renderOpcoes(tema) {
  const container = document.createElement("div");
  container.className = "opcoes-container";

  opcoesEstudo.forEach((opcao, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opcao.nome;

    btn.style.opacity = 0;
    btn.style.transition = "opacity 0.4s ease";

    setTimeout(() => { btn.style.opacity = 1; }, 200 * i);

    btn.addEventListener("click", () => {
      const promptFinal = opcao.prompt.replaceAll("{tema}", temaAtual);
      navigator.clipboard.writeText(promptFinal).then(() => {
        showToast(`✅ "${opcao.nome}" copiado!`);
      });
    });
    container.appendChild(btn);
  });

  // botão salvar
  const salvarBtn = document.createElement("button");
  salvarBtn.className = "save-btn";
  salvarBtn.textContent = "⭐ Salvar Tema";

  salvarBtn.style.opacity = 0;
  salvarBtn.style.transition = "opacity 0.4s ease";

  setTimeout(() => { salvarBtn.style.opacity = 1; }, 1200);

  salvarBtn.addEventListener("click", () => salvarTema(temaAtual));
  container.appendChild(salvarBtn);

  chatMessages.appendChild(container);
  scrollToBottom();
}

function addMessage(tipo, texto) {
  const msg = document.createElement("div");
  msg.className = `message ${tipo}`;
  msg.textContent = texto;
  chatMessages.appendChild(msg);
  scrollToBottom();

  if (tipo === "user") temaAtual = texto;

  return msg;
}

// ================================
// Salvar tema no localStorage
// ================================
function salvarTema(tema) {
  let salvos = JSON.parse(localStorage.getItem("temasSalvos")) || [];

  if (salvos.some(item => item.tema === tema)) {
    showToast(`⚠️ O tema "${tema}" já foi salvo.`);
    return;
  }

  if (salvos.length >= 10) {
    salvos.shift(); // remove o mais antigo
  }

  salvos.push({
    tema,
    opcoes: opcoesEstudo.map(o => ({
      nome: o.nome,
      prompt: o.prompt.replaceAll("{tema}", tema)
    }))
  });

  localStorage.setItem("temasSalvos", JSON.stringify(salvos));
  showToast(`⭐ Tema "${tema}" salvo!`);
}

// ================================
// Drawer de Configurações
// ================================
settingsBtn.addEventListener("click", () => {
  drawer.setAttribute("aria-hidden", "false");
  drawerOverlay.classList.add("active");
});

closeDrawerBtn.addEventListener("click", fecharDrawer);
drawerOverlay.addEventListener("click", fecharDrawer);

function fecharDrawer() {
  drawer.setAttribute("aria-hidden", "true");
  drawerOverlay.classList.remove("active");
}

// ================================
// Ações dos botões do Drawer
// ================================
document.querySelectorAll(".drawer-option").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    switch (action) {
      case "theme":
        toggleTheme();
        break;
      case "about":
        window.location.href = "sobre.html"; // 👉 vai para a nova página
        break;
      case "help":
        showToast("❓ Ajuda: Digite um tema e clique em uma opção.");
        break;
    }
    fecharDrawer();
  });
});

// ================================
// Controle de tema (Claro / Escuro / Automático)
// ================================
function toggleTheme() {
  const current = localStorage.getItem("theme") || "auto";
  let next;

  if (current === "auto") next = "light";
  else if (current === "light") next = "dark";
  else next = "auto";

  localStorage.setItem("theme", next);
  applyTheme(next);

  showToast(`🌗 Tema: ${next === "auto" ? "Automático" : next === "light" ? "Claro" : "Escuro"}`);
}

function applyTheme(mode) {
  document.body.classList.remove("dark");
  if (mode === "dark" || (mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.body.classList.add("dark");
  }
}

// aplicar tema na carga inicial
(function initTheme() {
  const saved = localStorage.getItem("theme") || "auto";
  applyTheme(saved);
})();
