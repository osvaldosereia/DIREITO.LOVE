// /app.js
// -------------------- Imports (absolutos) --------------------
import { $, $$, toast, copyToClipboard, trapFocus } from '/js/utils.js';
import { ACESSORIOS } from '/js/data-acessorios.js';
import { buscarSugestoesTema } from '/js/busca-legislacao.js';
import { salvarPrompt } from '/js/recents.js';

// Favoritos (estrela inline)
import {
  orderModules, isFav, toggleFav,
  getFavs, setFavs,
  getPrefAutoselectFavs, setPrefAutoselectFavs
} from '/js/prefs.js';

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

// Cria um chip (botão) selecionável (usado para SUGESTÕES do KB)
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

// Chip de ACESSÓRIO com estrela de favorito (⭐)
function makeChipWithStar({ id, label }) {
  const wrap = document.createElement('div');
  wrap.className = 'chip-wrap';

  // Botão principal (seleciona/desseleciona o módulo)
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.type = 'button';
  chip.dataset.id = id;
  chip.setAttribute('aria-pressed', 'false');
  chip.textContent = label;
  chip.addEventListener('click', () => {
    const pressed = chip.getAttribute('aria-pressed') === 'true';
    chip.setAttribute('aria-pressed', String(!pressed));
    validateGerar();
  });
  if (isFav(id)) chip.classList.add('is-fav');

  // Estrela (favoritar) — separada para não conflitar com o chip
  const star = document.createElement('button');
  star.className = 'chip-star';
  star.type = 'button';
  const favNow = isFav(id);
  star.setAttribute('aria-pressed', String(favNow));
  star.setAttribute('aria-label', (favNow ? 'Remover dos' : 'Adicionar aos') + ' favoritos: ' + label);
  star.dataset.id = id;
  star.textContent = favNow ? '★' : '☆';

  star.addEventListener('click', (ev) => {
    ev.stopPropagation(); // não dispara o click do chip
    const now = toggleFav(id);
    star.setAttribute('aria-pressed', String(now));
    star.textContent = now ? '★' : '☆';
    if (now) chip.classList.add('is-fav'); else chip.classList.remove('is-fav');
    toast(now ? '⭐ Adicionado aos favoritos' : '☆ Removido dos favoritos');
    // Re-render para reordenar, preservando seleções atuais
    renderAcessorios(true);
  });

  wrap.appendChild(chip);
  wrap.appendChild(star);
  return wrap;
}

// -------------------- Acessórios --------------------
// Renderiza a lista de acessórios (favoritos primeiro), com opção de preservar seleções atuais.
function renderAcessorios(preserveSelection = false) {
  const list = $('#acessorios-list');

  // Quais chips estão selecionados antes de re-renderizar?
  const prevSelected = new Set(
    preserveSelection
      ? Array.from(list.querySelectorAll('.chip[aria-pressed="true"]')).map(el => el.dataset.id)
      : []
  );

  list.innerHTML = '';
  const ordered = orderModules(ACESSORIOS) || ACESSORIOS;
  ordered.forEach(a => {
    list.appendChild(makeChipWithStar({ id: a.id, label: a.nome }));
  });

  // Seleção desejada = seleção anterior ∪ (favoritos se pref. autoselect estiver ON E NÃO estivermos preservando)
  const wantSelected = new Set(prevSelected);
  if (!preserveSelection && getPrefAutoselectFavs()) {
    getFavs().forEach(id => wantSelected.add(id));
  }

  // Aplica seleção desejada (usando .click() para manter validações)
  if (wantSelected.size > 0) {
    list.querySelectorAll('.chip').forEach(chip => {
      const id = chip.dataset.id;
      const already = chip.getAttribute('aria-pressed') === 'true';
      if (wantSelected.has(id) && !already) chip.click();
    });
  }

  validateGerar();
}

function showAcessorios() {
  const sec = $('#acessorios-sec');
  renderAcessorios(false);
  sec.classList.remove('hidden');
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

  // Compartilhar (Web Share + fallbacks)
  const shareBtn = $('#share-btn');
  if (shareBtn) {
    shareBtn.onclick = async () => {
      const prompt = buildPrompt(tema);
      const title = `direito.love — ${tema}`;
      const safeName = `prompt-${(tema || 'direito-love')
        .replace(/\W+/g, '-')
        .toLowerCase()
        .slice(0, 50)}.txt`;
      await shareText(prompt, { title, filename: safeName });
    };
  }

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

  // Wire dos controles do Drawer (se existirem na página)
  const chkAuto = $('#pref-autoselect');
  if (chkAuto) {
    chkAuto.checked = getPrefAutoselectFavs();
    chkAuto.onchange = () => {
      setPrefAutoselectFavs(chkAuto.checked);
      toast(chkAuto.checked ? '✅ Favoritos entram marcados' : '☑ Marque manualmente');
    };
  }

  const btnClear = $('#pref-clear-favs');
  if (btnClear) {
    btnClear.onclick = () => {
      setFavs([]);
      toast('🧹 Favoritos limpos');
      // Se a seção estiver visível, re-renderiza para tirar “is-fav”
      if (!$('#acessorios-sec').classList.contains('hidden')) {
        renderAcessorios(true);
      }
    };
  }

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
          // id estável e simples (sugestões não têm estrela no V1)
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
