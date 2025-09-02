// ================================
// app.js - direito.love (com auto-scroll e toast)
// ================================

// Seletores principais
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const drawer = document.getElementById("settings-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-settings");
const settingsBtn = document.querySelector(".settings-btn");

// Função de feedback visual (toast)
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Objetivos fixos (padrão)
const opcoesEstudo = [
  { nome: "Explicação Detalhada", prompt: "Explique detalhadamente o tema {tema}, com exemplos, tópicos e separadores.\n\n---\n💚 direito.love" },
  { nome: "Questões Objetivas", prompt: "Crie 5 questões objetivas de múltipla escolha sobre {tema}, com alternativas e resposta correta.\n\n---\n💚 direito.love" },
  { nome: "Revisão Rápida", prompt: "Monte um resumo rápido sobre {tema}, em tópicos curtos e claros, ideal para revisar em 5 minutos.\n\n---\n💚 direito.love" },
  { nome: "Pegadinhas de Prova", prompt: "Liste pegadinhas de prova comuns sobre {tema}, com explicação de porque estão erradas.\n\n---\n💚 direito.love" },
  { nome: "Casos Concretos", prompt: "Crie 2 casos práticos envolvendo {tema}, peça análise e resposta fundamentada.\n\n---\n💚 direito.love" }
];

let temaAtual = "";

// Scroll automático para última mensagem
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Envio do tema
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const tema = chatInput.value.trim();
  if (!tema) {
    showToast("⚠️ Digite um tema antes de enviar!");
    return;
  }

  // mensagem do usuário
  addMessage("user", tema);

  // resposta automática do bot com opções
  addMessage("bot", "Pronto! Já gerei 5 prompts de estudo. É só clicar no que quiser copiar:");

  renderOpcoes(tema);

  chatInput.value = "";
});

// Renderizar botões de opções
function renderOpcoes(tema) {
  const container = document.createElement("div");
  container.className = "opcoes-container";

  opcoesEstudo.forEach(opcao => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opcao.nome;
    btn.addEventListener("click", () => {
      const promptFinal = opcao.prompt.replaceAll("{tema}", temaAtual);
      navigator.clipboard.writeText(promptFinal).then(() => {
        showToast(`✅ Prompt de "${opcao.nome}" copiado!`);
      });
    });
    container.appendChild(btn);
  });

  // botão salvar
  const salvarBtn = document.createElement("button");
  salvarBtn.className = "save-btn";
  salvarBtn.textContent = "⭐ Salvar Tema";
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

  if (tipo === "user") {
    temaAtual = texto;
  }
}

// Salvar tema no localStorage
function salvarTema(tema) {
  let salvos = JSON.parse(localStorage.getItem("temasSalvos")) || [];
  salvos.push({
    tema,
    opcoes: opcoesEstudo.map(o => ({
      nome: o.nome,
      prompt: o.prompt.replaceAll("{tema}", tema)
    }))
  });
  localStorage.setItem("temasSalvos", JSON.stringify(salvos));
  showToast(`⭐ Tema "${tema}" salvo com sucesso!`);
}

// ================================
// Drawer de Configurações
// ================================
settingsBtn.addEventListener("click", () => {
  drawer.setAttribute("aria-hidden", "false");
  drawerOverlay.classList.add("active");
});

closeDrawerBtn.addEventListener("click", () => {
  fecharDrawer();
});

drawerOverlay.addEventListener("click", () => {
  fecharDrawer();
});

function fecharDrawer() {
  drawer.setAttribute("aria-hidden", "true");
  drawerOverlay.classList.remove("active");
}
