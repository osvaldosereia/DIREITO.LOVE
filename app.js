// ===== app.js FINAL =====

// Seletores principais
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const drawer = document.getElementById("settings-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-settings");
const settingsBtn = document.querySelector(".settings-btn");
const toast = document.getElementById("toast");

let temaAtual = "";
let categoriaAtual = "tema";
let promptsConfig = null;
let promptsBase = null;

// ==============================
// Toast feedback
// ==============================
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("show");
  clearTimeout(toastTimeout);
  setTimeout(() => toast.classList.add("show"), 50);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), message.length > 40 ? 3500 : 1800);
}

// ==============================
// Scroll helper
// ==============================
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==============================
// Carregar JSONs de configuração
// ==============================
async function carregarConfigs() {
  try {
    const resPrompts = await fetch("prompts.json");
    const resBase = await fetch("prompts-base.json");
    promptsConfig = await resPrompts.json();
    promptsBase = await resBase.json();
  } catch (err) {
    console.error("Erro ao carregar JSONs:", err);
    showToast("⚠️ Falha ao carregar configurações");
  }
}

// ==============================
// Mensagens
// ==============================
function addMessage(tipo, texto) {
  const msg = document.createElement("div");
  msg.className = `message ${tipo}`;
  msg.textContent = texto;
  chatMessages.appendChild(msg);
  scrollToBottom();
  return msg;
}

// ==============================
// Renderizar objetivos (botões)
// ==============================
function renderOpcoes(categoria, entrada) {
  // Limpa opções anteriores
  document.querySelectorAll(".opcoes-container").forEach(el => el.remove());

  const container = document.createElement("div");
  container.className = "opcoes-container";

  promptsConfig.objetivos.forEach((objetivo, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = objetivo.titulo;
    btn.style.opacity = 0;
    btn.style.transition = "opacity 0.4s ease";
    setTimeout(() => { btn.style.opacity = 1; }, 200 * i);

    btn.addEventListener("click", () => {
      if (!temaAtual) {
        showToast("⚠️ Entrada inválida. Tente novamente.");
        return;
      }
      const basePrompt = promptsBase[objetivo.id] || "{entrada}";
      const promptFinal = basePrompt
        .replaceAll("{tema}", entrada)
        .replaceAll("{texto}", entrada)
        .replaceAll("{youtube}", entrada)
        .replaceAll("{arquivo}", entrada);

      navigator.clipboard.writeText(promptFinal).then(() => {
        showToast(`✅ \"${objetivo.titulo}\" copiado!`);
      });
    });

    container.appendChild(btn);
  });

  // Botão salvar tema
  const salvarBtn = document.createElement("button");
  salvarBtn.className = "save-btn";
  salvarBtn.textContent = "⭐ Salvar Tema";
  salvarBtn.addEventListener("click", () => salvarTema(entrada, categoria));
  container.appendChild(salvarBtn);

  chatMessages.appendChild(container);
  scrollToBottom();
}

// ==============================
// Salvar temas no localStorage
// ==============================
function salvarTema(entrada, categoria) {
  let salvos = JSON.parse(localStorage.getItem("temasSalvos")) || [];
  if (salvos.some(item => item.entrada === entrada && item.categoria === categoria)) {
    showToast(`⚠️ O item já foi salvo.`);
    return;
  }
  if (salvos.length >= 30) salvos.shift();

  const opcoes = promptsConfig.objetivos.map(obj => ({
    nome: obj.titulo,
    prompt: (promptsBase[obj.id] || "{entrada}")
      .replaceAll("{tema}", entrada)
      .replaceAll("{texto}", entrada)
      .replaceAll("{youtube}", entrada)
      .replaceAll("{arquivo}", entrada)
  }));

  salvos.push({ categoria, entrada, opcoes });
  localStorage.setItem("temasSalvos", JSON.stringify(salvos));
  showToast("⭐ Tema salvo com sucesso!");
}

// ==============================
// Eventos do formulário
// ==============================
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const entrada = chatInput.value.trim();
  if (!entrada) {
    showToast("⚠️ Digite algo antes de enviar!");
    return;
  }

  temaAtual = entrada;
  categoriaAtual = "tema"; // por padrão, tema. (futuramente pode detectar pelo input)

  addMessage("user", entrada);
  const typingMsg = addMessage("bot", "digitando...");

  setTimeout(() => {
    typingMsg.innerHTML = "<b>Legal!</b><br>Escolha o tipo de questão ou material de estudo.";
    renderOpcoes(categoriaAtual, entrada);
  }, 800);

  chatInput.value = "";
});

// ==============================
// Drawer lateral (configurações)
// ==============================
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
        showToast("❓ Ajuda: Digite um tema e escolha uma opção.");
        break;
    }
    fecharDrawer();
  });
});

// ==============================
// Inicialização
// ==============================
window.addEventListener("load", carregarConfigs);
