// js/utils.js

// Seletores rápidos
export const $  = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// Toast (notificação rápida)
export const toast = (msg, timeout = 2200) => {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  window.setTimeout(() => t.classList.remove('show'), timeout);
};

// Copiar para a área de transferência
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast('✅ Copiado');
    return true;
  } catch (e) {
    console.error(e);
    toast('⚠ Falhou ao copiar');
    return false;
  }
};

// Helpers para JSON no localStorage
export const readJSON  = (k, f = null) => {
  try { 
    return JSON.parse(localStorage.getItem(k) || JSON.stringify(f)); 
  } catch { 
    return f; 
  }
};
export const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Trap de foco para modais (acessibilidade)
export function trapFocus(modalEl) {
  const FOCUSABLE = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const nodes = Array.from(modalEl.querySelectorAll(FOCUSABLE))
    .filter(el => !el.disabled && !el.getAttribute('aria-hidden'));

  if (!nodes.length) return () => {};

  const first = nodes[0], last = nodes[nodes.length - 1];

  const handler = (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };

  modalEl.addEventListener('keydown', handler);

  // Foca no primeiro elemento do modal
  window.setTimeout(() => first.focus(), 50);

  return () => modalEl.removeEventListener('keydown', handler);
}
