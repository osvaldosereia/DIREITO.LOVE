// ================================
// Gerenciamento de Tema (Claro / Escuro / Automático)
// ================================

// Aplica o tema salvo ou automático
function aplicarTema() {
  const temaSalvo = localStorage.getItem("temaPreferido");

  if (temaSalvo === "claro") {
    document.body.classList.remove("dark");
  } else if (temaSalvo === "escuro") {
    document.body.classList.add("dark");
  } else {
    // Automático (segue preferências do sistema)
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }
}

// Alterna entre os modos (usado no botão do drawer)
function alternarTema() {
  const temaAtual = localStorage.getItem("temaPreferido");

  if (temaAtual === "claro") {
    localStorage.setItem("temaPreferido", "escuro");
    showToast("🌙 Tema escuro ativado");
  } else if (temaAtual === "escuro") {
    localStorage.setItem("temaPreferido", "auto");
    showToast("⚡ Tema automático ativado");
  } else {
    localStorage.setItem("temaPreferido", "claro");
    showToast("☀️ Tema claro ativado");
  }

  aplicarTema();
}

// Executa quando a página carrega
document.addEventListener("DOMContentLoaded", aplicarTema);

// Observa mudanças no sistema (se estiver em automático)
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (localStorage.getItem("temaPreferido") === "auto") {
    aplicarTema();
  }
});
