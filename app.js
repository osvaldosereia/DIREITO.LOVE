/*
  QuestGPT — app.js
  - 100% client-side, sem dependências externas
  - Fluxo: Boas-vindas → tema (80 chars) → pensando (3s) → seleção obrigatória → (opcional) dicas JSON → gerar prompt → copiar/salvar/compartilhar
  - Acessibilidade: ARIA, foco, toasts; iOS/Android UX: touch 44px, keyboard-safe area, toasts
*/
(function () {
  'use strict';

  // ===== Utilidades =====
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const toast = (msg, timeout = 2200) => {
    const t = $('#toast');
    if (!t) return; 
    t.textContent = msg; 
    t.classList.add('show');
    window.setTimeout(() => t.classList.remove('show'), timeout);
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const state = {
    tema: '',
    includeOptions: [],
    dicasEncontradas: [],
    dicasSelecionadas: [],
    currentView: '#/chat',
    installPromptEvent: null,
  };

  const INCLUDE_OPTS = [
    'Explicação Rápida', 'Cheklist', '(0-10) Questões Objetivsa', 
    '(0-3) Questões Dissertativas', '(0-3) Casos Concretos', 
    'Doutrina', 'Jurisprudencia', 'Artigos Correlatos', 
    'Relação Processual', 'Pratica Jurídica', 'Debate', 
    'Erros Comuns', 'Peganinhas de Provas', 'Dicas de Pesquisa', 
    'Curiosidades', 'Quadro Comparativo'
  ];

  // Correções ortográficas internas
  const NORMALIZE = {
    'Cheklist': 'Checklist',
    'Questões Objetivsa': 'Questões Objetivas',
    'Peganinhas de Provas': 'Pegadinhas de Provas',
    'Pratica Jurídica': 'Prática Jurídica'
  };

  // ===== Roteador simples (hash) =====
  function setRoute(hash) {
    state.currentView = hash;
    const views = $$('.view');
    views.forEach(v => v.hidden = true);
    if (hash === '#/salvos') $('#view-salvos').hidden = false;
    else if (hash === '#/como-usar') $('#view-como-usar').hidden = false;
    else if (hash === '#/sobre') $('#view-sobre').hidden = false;
    else $('#view-chat').hidden = false;
    if (hash === '#/chat') $('#tema').focus();
    if (hash === '#/salvos') renderSalvos();
  }
  window.addEventListener('hashchange', () => setRoute(location.hash || '#/chat'));

  // ===== Drawer lateral =====
  const drawer = $('#drawer');
  const btnDrawer = $('#btnDrawer');
  const btnCloseDrawer = $('.drawer-close');
  function openDrawer() {
    drawer.setAttribute('aria-hidden', 'false');
    btnDrawer.setAttribute('aria-expanded', 'true');
    const firstLink = $('.drawer-nav a');
    firstLink && firstLink.focus();
  }
  function closeDrawer() {
    drawer.setAttribute('aria-hidden', 'true');
    btnDrawer.setAttribute('aria-expanded', 'false');
    btnDrawer.focus();
  }
  btnDrawer.addEventListener('click', openDrawer);
  btnCloseDrawer.addEventListener('click', closeDrawer);
  $$('.nav-link').forEach(a => a.addEventListener('click', closeDrawer));

  // ===== Menu Tema =====
  const btnTheme = $('#btnTheme');
  const themeMenu = $('#themeMenu');
  btnTheme.addEventListener('click', () => {
    const shown = themeMenu.getAttribute('aria-hidden') === 'false';
    themeMenu.setAttribute('aria-hidden', shown ? 'true' : 'false');
  });
  themeMenu.addEventListener('click', (e) => {
    if (e.target.matches('[data-theme]')) {
      const t = e.target.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('questgpt:theme', t);
      themeMenu.setAttribute('aria-hidden', 'true');
      toast(`Tema: ${t}`);
    }
  });
  (function initTheme(){
    const saved = localStorage.getItem('questgpt:theme') || 'auto';
    document.documentElement.setAttribute('data-theme', saved);
  })();

  // ===== PWA Install =====
  const btnInstall = $('#btnInstall');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.installPromptEvent = e;
    btnInstall.hidden = false;
  });
  btnInstall.addEventListener('click', async () => {
    if (!state.installPromptEvent) return;
    state.installPromptEvent.prompt();
    const choice = await state.installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') toast('App instalado');
    state.installPromptEvent = null;
    btnInstall.hidden = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js');
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      toast('App atualizado. Reabra para aplicar.');
    });
  }

  // ===== Chat =====
  const chat = $('#chat');
  function addMsg(title, body, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'msg';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (title) { const h = document.createElement('h3'); h.textContent = title; bubble.appendChild(h); }
    if (body) { 
      if (typeof body === 'string') { 
        const p = document.createElement('p'); 
        p.innerHTML = body; 
        bubble.appendChild(p); 
      } else { bubble.appendChild(body); } 
    }
    if (opts.footer) { 
      const s = document.createElement('div'); 
      s.className = 'subtle'; 
      s.textContent = opts.footer; 
      bubble.appendChild(s); 
    }
    wrap.appendChild(bubble);
    chat.appendChild(wrap);
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    return bubble;
  }

  function welcome() {
    chat.innerHTML = '';
    addMsg('Bem-vindo!','Este é um gerador de prompts educacionais para estudantes de Direito. Vamos começar pelo <strong>tema</strong> em até 80 caracteres.');
  }

  // ===== Composer =====
  const composer = $('#composer');
  const temaInput = $('#tema');
  const enviarBtn = $('#enviar');
  const charCount = $('#charCount');

  temaInput.addEventListener('input', () => {
    const n = clamp(temaInput.value.length, 0, 80);
    charCount.textContent = n;
  });

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const tema = (temaInput.value || '').trim();
    if (!tema) { toast('Digite um tema.'); temaInput.focus(); return; }
    state.tema = tema;
    addMsg('Você digitou:', `<strong>${tema}</strong>`, { footer: 'Analisando...' });
    temaInput.value = ''; charCount.textContent = '0'; enviarBtn.disabled = true;
    const thinking = addMsg('Pensando…', 'Gerando sugestões iniciais. Aguarde 3 segundos.');
    window.setTimeout(() => {
      thinking.querySelector('p').textContent = 'Pronto! Selecione o que devemos incluir.';
      showIncludeSelector();
      enviarBtn.disabled = false;
    }, 3000);
  });

  // ===== Selector =====
  function showIncludeSelector() {
    const form = document.createElement('form');
    form.className = 'selector';
    form.setAttribute('aria-label', 'O que devemos incluir?');

    INCLUDE_OPTS.forEach((label, idx) => {
      const chip = document.createElement('label'); chip.className = 'chip';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = label;
      const span = document.createElement('span'); span.textContent = label;
      chip.append(cb, span); form.appendChild(chip);
    });

    const btnGerar = document.createElement('button');
    btnGerar.type = 'button'; btnGerar.className = 'primary-btn'; btnGerar.textContent = 'Gerar Prompt';
    btnGerar.addEventListener('click', gerarPromptFinal);
    form.appendChild(btnGerar);

    addMsg('O que devemos incluir?', form, { footer: 'Selecione ao menos 1 item.' });
  }

  // ===== Gerar Prompt =====
  function gerarPromptFinal() {
    const tema = state.tema;
    const inc = $$('#chat .selector input:checked').map(i => NORMALIZE[i.value] || i.value);
    if (inc.length === 0) { toast('Escolha ao menos 1 item.'); return; }

    const checkpointBlocks = [];
    for (let i = 0; i < inc.length; i += 2) {
      const par = inc.slice(i, i+2);
      checkpointBlocks.push(`Após concluir ${par.join(' e ')}, solicite autorização para continuar.`);
    }

    const prompt = `# Estudo guiado de Direito — ${tema}\n\n` +
      `## Persona\nProfessor de Direito com didática acessível.\n\n` +
      `## Itens a incluir\n${inc.map(i=>`- ${i}`).join('\n')}\n\n` +
      `## Regras de Progresso\n${checkpointBlocks.join('\n')}\n\n` +
      `---\nAssinatura: [direito.love](https://direito.love)`;

    const pre = document.createElement('pre'); 
    pre.textContent = prompt; 
    pre.style.whiteSpace = 'pre-wrap';

    const actions = document.createElement('div');
    const btnCopy = document.createElement('button'); btnCopy.textContent = 'Copiar';
    btnCopy.addEventListener('click', async ()=>{ 
      await navigator.clipboard.writeText(prompt); 
      toast('Copiado com sucesso'); 
    });
    actions.append(btnCopy);

    const container = document.createElement('div'); 
    container.append(pre, actions);
    addMsg('Prompt gerado', container);
  }

  // ===== Salvos =====
  const SALVOS_KEY = 'questgpt:salvos';
  function getSalvos() { 
    try { return JSON.parse(localStorage.getItem(SALVOS_KEY) || '[]'); } catch { return []; } 
  }
  function renderSalvos() {
    const ul = $('#listaSalvos'); if (!ul) return;
    ul.innerHTML = '';
    getSalvos().forEach(s => {
      const li = document.createElement('li'); li.textContent = s.tema;
      ul.append(li);
    });
  }

  // ===== Inicialização =====
  $('#year').textContent = new Date().getFullYear();
  welcome();
  setRoute(location.hash || '#/chat');
})();
