/* ==================================
   Lógica principal - direito.love
   ================================== */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// Estado global
let selectedOptions = [];
let selectedSuggestions = [];

// Inicialização
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
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.add("theme-light");
    }
  }
}

// Mensagem inicial
function showWelcomeMessage() {
  simulateThinking(() => {
    showMessage("system", "👋 Bem-vindo ao direito.love! Qual é o tema do seu estudo hoje? (máx. 80 caracteres)");
  });
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

// Loader digitando
function showTyping() {
  const messagesDiv = document.getElementById("messages");
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("typing");
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return typingDiv;
}

function simulateThinking(callback) {
  const typingDiv = showTyping();
  setTimeout(() => {
    typingDiv.remove();
    callback();
  }, 2000);
}

// Eventos principais
function setupEventListeners() {
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  input.addEventListener("input", () => {
    if (input.value.trim().length > 0) {
      sendBtn.disabled = false;
      sendBtn.classList.add("enabled");
    } else {
      sendBtn.disabled = true;
      sendBtn.classList.remove("enabled");
    }
  });

  sendBtn.addEventListener("click", handleUserInput);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") handleUserInput();
  });
}

// Lógica do input do usuário
function handleUserInput() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) {
    showToast("Digite um tema (até 80 caracteres).");
    return;
  }
  if (text.length > 80) {
    showToast("O tema deve ter no máximo 80 caracteres.");
    return;
  }
  showMessage("user", text);
  input.value = "";
  document.getElementById("send-btn").disabled = true;

  simulateThinking(() => askOptions());
}

// Pergunta múltipla escolha
function askOptions() {
  showMessage("system", "O que devemos incluir? (Selecione pelo menos 1 opção)");

  const options = [
    "Explicação Rápida",
    "Checklist",
    "Questões Objetivas (0–10)",
    "Questões Dissertativas (0–3)",
    "Casos Concretos (0–3)",
    "Doutrina",
    "Jurisprudência",
    "Artigos Correlatos",
    "Relação Processual",
    "Prática Jurídica",
    "Debate",
    "Erros Comuns",
    "Pegadinhas de Provas",
    "Dicas de Pesquisa",
    "Curiosidades",
    "Quadro Comparativo"
  ];

  const optionsArea = document.getElementById("options-area");
  optionsArea.innerHTML = "";

  options.forEach(opt => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = opt;
    checkbox.addEventListener("change", e => {
      if (e.target.checked) {
        selectedOptions.push(opt);
      } else {
        selectedOptions = selectedOptions.filter(o => o !== opt);
      }
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(opt));
    optionsArea.appendChild(label);
  });

  const generateBtn = document.getElementById("generate-btn");
  generateBtn.disabled = false;
  generateBtn.onclick = () => {
    if (selectedOptions.length === 0) {
      showToast("Escolha pelo menos 1 opção.");
      return;
    }
    showToast("Opções registradas. (Próxima etapa: sugestões contextuais)");
  };
}

// Feedback (toast)
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
