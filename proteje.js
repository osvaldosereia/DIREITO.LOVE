// === protege.js — Bloqueio básico de cópia ===

// 🔒 Desativa botão direito do mouse
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// 🔒 Bloqueia atalhos comuns de cópia e inspeção
document.addEventListener("keydown", function (e) {
  const key = e.key.toLowerCase();
  const isBlockedCombo =
    (e.ctrlKey && ["c", "u", "s", "p", "x", "a"].includes(key)) ||
    (e.metaKey && ["c", "u", "s", "p", "x", "a"].includes(key)) || // macOS
    key === "f12";

  if (isBlockedCombo) {
    e.preventDefault();
  }
});

// 🔒 Impede seleção de texto (precisa ser incluído também no CSS do site)
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = `
    body {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  `;
  document.head.appendChild(style);
});
