/* ==================================
   Lógica principal - direito.love
   ================================== */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// Estado global
let selectedOptions = [];
let selectedSuggestions = [];
let currentTheme = "";
let lastStep = null;

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
      .then(reg => {
        if (reg.waiting) {
          showToast("Nova versão disponível. Reabra o app.");
        }
      })
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

  // Modal actions
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("copy-btn").addEventListener("click", copyPrompt);
  document.getElementById("save-btn").addEventListener("click", savePrompt);
  document.getElementById("share-btn").addEventListener("click", sharePrompt);
  document.getElementById("refazer-btn").addEventListener("click", refazerPrompt);

  // Swipe down to close modal
  let startY = 0;
  const modal = document.getElementById("prompt-modal");
  modal.addEventListener("touchstart", e => { startY = e.touches[0].clientY; });
  modal.addEventListener("touchend", e => {
    let endY = e.changedTouches[0].clientY;
    if (endY - startY > 100) { closeModal(); }
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
  currentTheme = text;
  showMessage("user", text);
  input.value = "";
  document.getElementById("send-btn").disabled = true;

  simulateThinking(() => askOptions());
}

// Pergunta múltipla escolha
function askOptions() {
  showMessage("system", "O que devemos incluir? (Selecione pelo menos 1 opção)");
  lastStep = "options";

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
  selectedOptions = [];

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

  const generateArea = document.getElementById("generate-area");
  generateArea.hidden = false;

  const generateBtn = document.getElementById("generate-btn");
  generateBtn.disabled = false;
  generateBtn.onclick = () => {
    if (selectedOptions.length === 0) {
      showToast("Escolha pelo menos 1 opção.");
      return;
    }
    loadSuggestions(currentTheme);
    generateArea.hidden = true;
  };
}

// Carregar sugestões do JSON
async function loadSuggestions(theme) {
  try {
    const res = await fetch("data/codigos.json");
    const data = await res.json();
    const related = data.filter(item =>
      item.conteudo.toLowerCase().includes(theme.toLowerCase()) ||
      item.referencia.toLowerCase().includes(theme.toLowerCase())
    );

    if (related.length === 0) {
      generatePrompt(selectedOptions, []);
      return;
    }

    showMessage("system", "Também encontramos conteúdos específicos relacionados a '" + theme + "'. Deseja incluir algum? (opcional)");
    lastStep = "suggestions";

    const optionsArea = document.getElementById("options-area");
    optionsArea.innerHTML = "";
    selectedSuggestions = [];

    related.forEach(item => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item.referencia + " — " + item.conteudo;
      checkbox.addEventListener("change", e => {
        if (e.target.checked) {
          selectedSuggestions.push(checkbox.value);
        } else {
          selectedSuggestions = selectedSuggestions.filter(s => s !== checkbox.value);
        }
      });
      label.appendChild(checkbox);
      const span = document.createElement("span");
      span.innerText = checkbox.value;
      label.appendChild(span);
      optionsArea.appendChild(label);
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.innerText = "Confirmar seleção";
    confirmBtn.onclick = () => { generatePrompt(selectedOptions, selectedSuggestions); };
    optionsArea.appendChild(confirmBtn);

  } catch (err) {
    console.error("Erro ao carregar sugestões:", err);
    generatePrompt(selectedOptions, []);
  }
}

// Geração do prompt
function generatePrompt(options, suggestions) {
  simulateThinking(() => {
    let prompt = "Você é um professor de Direito experiente e didático. Ajude o estudante no tema: " + currentTheme + "\n\n";
    prompt += "Inclua os seguintes elementos:\n- " + options.join("\n- ") + "\n\n";
    if (suggestions.length > 0) {
      prompt += "Considere também os seguintes conteúdos específicos:\n- " + suggestions.join("\n- ") + "\n\n";
    }
    prompt += "Formate a resposta com títulos, subtítulos, listas e espaçamento duplo entre capítulos.\n";
    prompt += "A cada 2 itens, solicite autorização do usuário para continuar.\n\n";
    prompt += "👉 Gerado por direito.love";

    openModal(prompt);
  });
}

// Exibir modal com refinamentos de acessibilidade
function openModal(content) {
  const modal = document.getElementById("prompt-modal");
  const promptText = document.getElementById("prompt-text");
  promptText.innerText = content;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  // Trap de foco
  const focusableElements = modal.querySelectorAll("button, [href], input, textarea, [tabindex]:not([tabindex='-1'])");
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener("keydown", e => {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === "Escape") {
      closeModal();
    }
  });

  firstElement.focus();
}

function closeModal() {
  const modal = document.getElementById("prompt-modal");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.getElementById("user-input").focus();
}

// Ações do prompt
function copyPrompt() {
  const content = document.getElementById("prompt-text").innerText;
  navigator.clipboard.writeText(content)
    .then(() => showToast("Prompt copiado com sucesso."))
    .catch(() => showToast("Não foi possível copiar."));
}

function savePrompt() {
  const content = document.getElementById("prompt-text").innerText;
  let prompts = JSON.parse(localStorage.getItem("prompts") || "[]");
  if (prompts.length >= 100) {
    prompts.shift();
    showToast("Limite de 100 prompts atingido. O mais antigo foi removido.");
  }
  prompts.push({ theme: currentTheme, text: content, date: new Date().toISOString() });
  localStorage.setItem("prompts", JSON.stringify(prompts));
  showToast("Prompt salvo com sucesso.");
}

function sharePrompt() {
  const content = document.getElementById("prompt-text").innerText;
  const url = "https://wa.me/?text=" + encodeURIComponent(content);
  window.open(url, "_blank");
}

function refazerPrompt() {
  closeModal();
  if (lastStep === "suggestions") {
    loadSuggestions(currentTheme);
  } else if (lastStep === "options") {
    askOptions();
  } else {
    showToast("Não há etapa anterior para refazer.");
  }
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
