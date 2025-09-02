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

  // limpa se já existir ativo
  toast.classList.remove("show");
  clearTimeout(toastTimeout);

  // exibe
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // duração adaptativa
  const duracao = message.length > 40 ? 3500 : 1800;

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duracao);
}

// ================================
// Objetivos fixos (padrão)
// ================================
const opcoesEstudo = [
  { nome: "Explicação Detalhada", prompt: "Explique detalhadamente o tema {tema}, com exemplos, tópicos e separadores.\n\n---\n💚 direito.love" },
  { nome: "Questões Objetivas", prompt: "Crie 5 questões objetivas de múltipla escolha sobre {tema}, com alternativas e resposta correta.\n\n---\n💚 direito.love" },
  { nome: "Revisão Rápida", prompt: "Monte um resumo rápido sobre {tema}, em tópicos curtos e claros, ideal para revisar em 5 minutos.\n\n---\n💚 direito.love" },
  { nome: "Pegadinhas de Prova", prompt: "Liste pegadinhas de prova comuns sobre {tema}, com explicação de porque estão erradas.\n\n---\n💚 direito.love" },
  { nome: "Casos Concretos", prompt: "Crie 2 casos práticos envolvendo {tema}, peça análise e resposta fundamentada.\n\n---\n💚 direito.love" }
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
        document.body.classList.toggle("dark");
        showToast("🌗 Tema alternado");
        break;
      case "language":
        showToast("🌍 Alterar idioma (em breve)");
        break;
      case "about":
        showToast("ℹ️ direito.love — App educacional para estudo");
        break;
      case "help":
        showToast("❓ Ajuda: Digite um tema e clique em uma opção.");
        break;
    }
    fecharDrawer();
  });
});
