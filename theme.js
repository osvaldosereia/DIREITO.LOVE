// ===== theme.js FINAL =====

// ==============================
// Controle de tema claro/escuro/auto
// ==============================
const THEME_KEY = "temaPreferido";

function aplicarTema(tema) {
  document.body.classList.remove("dark");
  if (tema === "escuro") {
    document.body.classList.add("dark");
  } else if (tema === "auto") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) document.body.classList.add("dark");
  }
}

function salvarTema(tema) {
  localStorage.setItem(THEME_KEY, tema);
  aplicarTema(tema);
}

function carregarTema() {
  const temaSalvo = localStorage.getItem(THEME_KEY) || "auto";
  aplicarTema(temaSalvo);
}

// ==============================
// Observador do sistema
// ==============================
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  const temaSalvo = localStorage.getItem(THEME_KEY) || "auto";
  if (temaSalvo === "auto") aplicarTema("auto");
});

// ==============================
// Inicialização
// ==============================
window.addEventListener("DOMContentLoaded", carregarTema);

// ==============================
// Integração com drawer (menu lateral)
// ==============================
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-action='theme']")) {
    const temaAtual = localStorage.getItem(THEME_KEY) || "auto";
    let novoTema;
    if (temaAtual === "claro") novoTema = "escuro";
    else if (temaAtual === "escuro") novoTema = "auto";
    else novoTema = "claro";

    salvarTema(novoTema);
    showToast(`🌗 Tema definido: ${novoTema}`);
  }
});
