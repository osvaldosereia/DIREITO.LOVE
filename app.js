// /app.js
// -------------------- Imports (absolutos) --------------------
import { $, $$, toast, copyToClipboard, trapFocus } from '/js/utils.js';
import { ACESSORIOS } from '/js/data-acessorios.js';
import { buscarSugestoesTema } from '/js/busca-legislacao.js';
import { salvarPrompt } from '/js/recents.js';

// -------------------- Estado simples --------------------
let cleanupTrap = null;

// -------------------- UI helpers --------------------
function saudacao() {
  const h = new Date().getHours();
  if (h >= 1 && h <= 5) return 'Noooite, acordado ainda?!';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function clearChat() {
  const area = $('#chat');
  if (area) area.innerHTML = '';
}

function scrollToEl(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

function addBot(text) {
  const area = $('#chat');
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-bot';
  wrap.innerHTML = `<div class="bubble" role="status">${text}</div>`;
  area.appendChild(wrap);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  return wrap;
}

function addUser(text) {
  const area = $('#chat');
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-user';
  wrap.innerHTML = `<div class="bubble">${text}</div>`;
  area.appendChild(wrap);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  return wrap;
}

function showThinking() {
  return addBot('... pensando');
}

// Cria um chip (botão) selecionável, reutilizável para acessórios e sugestões
function makeChip({ id, label }) {
  const b = document.createElement('button');
  b.className = 'chip';
  b.type = 'button';
  b.setAttribute('aria-pressed', 'false');
  b.dataset.id = id;
  b.textContent = label;
  b.addEventListener('click', () => {
    const pressed = b.getAttribute('aria-pressed') === 'true';
    b.setAttribute('aria-pressed', String(!pressed));
    validateGerar();
  });
  return b;
}

// -------------------- Acessórios --------------------
function showAcessorios() {
  const sec = $('#acessorios-sec');
  const list = $('#acessorios-list');
  list.innerHTML = '';
  ACESSORIOS.forEach((a) => {
    list.appendChild(makeChip({ id: a.id, label: a.nome }));
  });
  sec.classList.remove('hidden');
  validateGerar();
}

// Retorna TODOS chips selecionados (acessórios + sugestões), sem duplicados
function selecionados() {
  const nodes = $$('.chip[aria-pressed="true"]');
  const uniq = new Map();
  nodes.forEach((x) => {
    const id = x.dataset.id || x.textContent.trim();
    if (!uniq.has(id)) {
      uniq.set(id, { id, nome: x.textContent.trim() });
    }
  });
  return Array.from(uniq.values());
}

function validateGerar() {
  const btn = $('#btn-gerar');
  if (btn) btn.disabled = selecionados().length < 1;
}

// -------------------- Prompt --------------------
function buildPrompt(tema) {
  const sel = selecionados();
  const bullets = sel.map((s) => `- ${s.nome}`).join('\n');
  const now = new Date().toISOString().slice(0, 10);
  return `Você é um professor de Direito altamente didático, especializado em OAB e concursos.
Objetivo: gerar um estudo sólido e confiável sobre o tema: "${tema}".
Inclua APENAS os módulos a seguir (se forem coerentes com o tema), sem inventar jurisprudência:
${bullets}

Regras:
- Linguagem simples e organizada (títulos, tópicos, exemplos práticos).
- Priorize jurisprudência MAJORITÁRIA (evite posições exóticas).
- Se citar artigos, informe número e lei; não invente números.
- Caso falte base segura, diga claramente o que falta.
- No final, sugira 5 temas correlatos numerados.

Assinatura: 💚 direito.love
Data: ${now}`;
}

// === Compartilhamento (Web Share + fallbacks) ===
async function shareText(text, { title = 'direito.love — Prompt', filename = 'prompt-direito-love.txt' } = {}) {
  if (!navigator.onLine) { toast('⚠ Requer conexão para compartilhar'); return false; }

  try {
    if (navigator.share) {
      if (text.length > 12000 && navigator.canShare) {
        const file = new File([text], filename, { type: 'text/plain' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title, files: [file] });
          return true;
        }
      }
      await navigator.share({ title, text });
      return true;
    }
  } catch (e) {
    if (e?.name === 'AbortError') { toast('Compartilhamento cancelado'); return false; }
  }

  if (text.length < 12000) {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(text);
    location.href = `mailto:?subject=${subject}&body=${body}`;
    return true;
  }

  try {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('⬇️ Exportado como .txt');
  } catch {}

  const ok = await copyToClipboard(text);
  if (ok) toast('✅ Copiado. Cole no app desejado.');
  return ok;
}


// -------------------- Resumo / Modal --------------------
function openResumo(tema) {
  scrollToEl(document.body);

  const overlay = $('#overlay');
  const modal = $('#resumo-modal');
  const list = $('#resumo-list');

  const sel = selecionados();
  list.innerHTML = sel.map((s) => `<li>${s.nome}</li>`).join('') || '<li>—</li>';

  overlay.classList.add('show');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  cleanupTrap = trapFocus(modal);

  // Copiar = salvar em Recentes + tentar copiar para a área de transferência
  $('#copy-btn').onclick = async () => {
    const prompt = buildPrompt(tema);

    // salva sempre no histórico
    salvarPrompt(prompt, { tema, mods: sel.map((s) => s.id) });

    // tenta copiar
    const ok = await copyToClipboard(prompt);
    if (ok) {
      toast('✅ Copiado e salvo em Recentes');
    } else {
      toast('⚠ Salvo em Recentes, mas não copiado');
    }
  };

  $('#close-resumo').onclick = closeResumo;
  $('#go-recentes').onclick = () => (location.href = '/recentes.html');
}

function closeResumo() {
  const overlay = $('#overlay');
  const modal = $('#resumo-modal');
  overlay.classList.remove('show');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  if (cleanupTrap) cleanupTrap();
}

// -------------------- Educativo --------------------
function maybeEducativo() {
  if (localStorage.getItem('educativo_ok')) return;
  const overlay = $('#overlay');
  const modal = $('#educativo-modal');

  $('#educativo-ok').onclick = () => {
    localStorage.setItem('educativo_ok', 'true');
    overlay.classList.remove('show');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  overlay.classList.add('show');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  cleanupTrap = trapFocus(modal);
}

// -------------------- Drawer --------------------
function setupDrawer() {
  const drawer = $('#drawer');
  const btn = $('#btn-settings');
  const close = $('#btn-close-drawer');
  const overlay = $('#overlay');

  const open = () => {
    drawer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    overlay.classList.add('show');
  };
  const shut = () => {
    drawer.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('show');
  };

  btn.addEventListener('click', open);
  close.addEventListener('click', shut);

  // Clicar fora fecha o drawer (se não houver modal aberto)
  overlay.addEventListener('click', () => {
    if (!drawer.classList.contains('open')) return;
    if (!$('#resumo-modal')?.classList.contains('hidden')) return;
    if (!$('#educativo-modal')?.classList.contains('hidden')) return;
    shut();
  });
}

// -------------------- Service Worker --------------------
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(console.error);
  }
}

// -------------------- Boot --------------------
window.addEventListener('DOMContentLoaded', () => {
  addBot(`${saudacao()}! Vamos criar um prompt top pra você.`);
  addBot('Qual o tema? Ex.: Danos estéticos relacionados a acidentes de trabalho');

  const input = $('#tema-input');
  const form = $('#tema-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tema = (input.value || '').trim().slice(0, 180);
    if (!tema) {
      input.focus();
      return;
    }

    // Reset total para novo tema
    clearChat();
    $('#acessorios-sec').classList.add('hidden');
    $('#sugestoes-sec').classList.add('hidden');
    $('#sugestoes-list').innerHTML = '';
    $$('.chip[aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', 'false'));

    addUser(tema);
    input.value = '';

    const think = showThinking();
    await new Promise((r) => setTimeout(r, 900));
    think.remove();

    addBot('Legal! Agora escolha o que quer incluir no seu prompt. (mín: 1)');
    showAcessorios();
    scrollToEl($('#acessorios-sec'));

    // Sugestões (não bloqueia a UI)
    buscarSugestoesTema(tema)
      .then((sugs) => {
        if (!sugs || !sugs.length) return;
        $('#lbl-sugestoes').textContent = `Sugestões (${sugs.length})`;
        const sec = $('#sugestoes-sec');
        const ul = $('#sugestoes-list');
        ul.innerHTML = '';

        sugs.forEach((s, i) => {
          // id estável e simples
          const id = `sug-${i}-${(s.titulo || 'item').toLowerCase().replace(/\s+/g, '-').slice(0, 40)}`;
          ul.appendChild(makeChip({ id, label: s.titulo || 'Item' }));
        });

        sec.classList.remove('hidden');
        validateGerar();
      })
      .catch(() => { /* silencioso */ });

    // Botão Gerar → abre o resumo (não salva aqui)
    const gerar = $('#btn-gerar');
    gerar.onclick = () => openResumo(tema);

    $('.bloco-gerar').classList.remove('hidden');
    scrollToEl($('.bloco-gerar'));
  });

  setupDrawer();
  registerSW();
  maybeEducativo();
});
