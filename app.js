/* ==================================
   Lógica principal - direito.love
   ================================== */

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  registerServiceWorker();
  setInitialTheme();
  showWelcomeMessage();
  setupEventListeners();
}

// Configurar Service Worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(err => console.error("Erro no Service Worker:", err));
  }
}

// Tema inicial
function setInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.add(savedTheme);
  } else {
    // auto = segue prefers-color-scheme
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.add("theme-light");
    }
  }
}

// Mensagem inicial
function showWelcomeMessage() {
  showMessage("system", "👋 Bem-vindo ao direito.love! Qual é o tema do seu estudo hoje?");
}

// Renderizar mensagens no chat
function showMessage(sender, text) {
  const messagesDiv = document.getElementById("messages");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerText = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Eventos principais
function setupEventListeners() {
  document.getElementById("send-btn").addEventListener("click", handleUserInput);
  document.getElementById("user-input").addEventListener("keypress", e => {
    if (e.key === "Enter") handleUserInput();
  });

  // Modal
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("copy-btn").addEventListener("click", copyPrompt);
  document.getElementById("save-btn").addEventListener("click", savePrompt);
  document.getElementById("share-btn").addEventListener("click", sharePrompt);
}

// Lógica do input do usuário
function handleUserInput() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) {
    showToast("Digite um tema (até 80 caracteres).");
    return;
  }
  showMessage("user", text);
  input.value = "";
  simulateThinking(() => askOptions());
}

// Delay humanizado
function simulateThinking(callback) {
  showMessage("system", "...");
  setTimeout(() => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.lastChild.remove(); // remove "..." 
    callback();
  }, 3000);
}

// Pergunta múltipla escolha
function askOptions() {
  showMessage("system", "O que devemos incluir? (Selecione ao menos 1)");
  // Aqui depois renderizamos checkboxes dinamicamente
}

// Exibir modal com prompt
function openModal(content) {
  const modal = document.getElementById("prompt-modal");
  const promptText = document.getElementById("prompt-text");
  promptText.innerText = content;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = document.getElementById("prompt-modal");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

// Ações do prompt
function copyPrompt() {
  const content = document.getElementById("prompt-text").innerText;
  navigator.clipboard.writeText(content)
    .then(() => showToast("Prompt copiado com sucesso."))
    .catch(() => showToast("Não foi possível copiar."));
}

function savePrompt() {
  showToast("Função de salvar será implementada.");
}

function sharePrompt() {
  showToast("Função de compartilhar será implementada.");
}

// Feedback simples (toast)
function showToast(message) {
  alert(message); // depois trocar por snackbar elegante
}
