// ================================
// app.js - direito.love (versão robusta e estável)
// ================================

// Seletores principais
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const drawer = document.getElementById("settings-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-settings");
const settingsBtn = document.querySelector(".settings-btn");

// Toast (mensagem flutuante)
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("show");
  clearTimeout(toastTimeout);
  setTimeout(() => toast.classList.add("show"), 50);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), message.length > 40 ? 3500 : 1800);
}

// Placeholder de objetivos
const opcoesEstudo = [
  { nome: "Resumo", prompt: "Gere um resumo do tema: {tema}" },
  { nome: "Questão objetiva", prompt: "Crie uma questão de múltipla escolha sobre: {tema}" },
  { nome: "Flashcard", prompt: "Crie um flashcard para revisar: {tema}" }
];

let temaAtual = "";

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Evento de envio do formulário
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const tema = chatInput.value.trim();
  if (!tema) {
    showToast("⚠️ Digite um tema antes de enviar!");
    return;
  }
  temaAtual = tema;

  // Limpa opções anteriores
  document.querySelectorAll(".opcoes-container").forEach(el => el.remove());

  addMessage("user", tema);
  const typingMsg = addMessage("bot", "digitando...");

  setTimeout(() => {
    typingMsg.innerHTML = "<b>Legal!</b><br>Escolha o prompt e cole na sua IA preferida 🤩";
    renderOpcoes(tema);
  }, 1000);

  chatInput.value = "";
});

// Renderiza os botões com opções
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
      if (!temaAtual) {
        showToast("⚠️ Tema inválido. Reenvie o tema.");
        return;
      }
      const promptFinal = opcao.prompt.replaceAll("{tema}", temaAtual);
      navigator.clipboard.writeText(promptFinal).then(() => {
        showToast(`✅ "${opcao.nome}" copiado!`);
      });
    });

    container.appendChild(btn);
  });

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
  return msg;
}

function salvarTema(tema) {
  let salvos = JSON.parse(localStorage.getItem("temasSalvos")) || [];
  if (salvos.some(item => item.tema === tema)) {
    showToast(`⚠️ O tema "${tema}" já foi salvo.`);
    return;
  }
  if (salvos.length >= 30) salvos.shift();
  salvos.push({
    tema,
    opcoes: opcoesEstudo.map(o => ({ nome: o.nome, prompt: o.prompt.replaceAll("{tema}", tema) }))
  });
  localStorage.setItem("temasSalvos", JSON.stringify(salvos));
  showToast(`⭐ Tema "${tema}" salvo!`);
}

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

document.querySelectorAll(".drawer-option").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    switch (action) {
      case "theme":
        document.body.classList.toggle("dark");
        showToast("🌗 Tema alternado");
        break;
      case "about":
        window.location.href = "sobre.html";
        break;
      case "help":
        showToast("❓ Ajuda: Digite um tema e clique em uma opção.");
        break;
    }
    fecharDrawer();
  });
});
