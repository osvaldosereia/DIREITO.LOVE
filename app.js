
// app.js — fluxo principal do chat
import { $, $$, toast, copyToClipboard, trapFocus } from './js/utils.js';
import { ACESSORIOS } from './js/data-acessorios.js';
import { buscarSugestoesTema } from './js/busca-legislacao.js';
import { salvarPrompt } from './js/recents.js';

let cleanupTrap = null;

// Greeting contextual
function saudacao(){
  const now = new Date();
  const h = now.getHours();
  if (h >= 1 && h <= 5) return 'Noooite, acordado ainda?';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Chat helpers
function addBot(text){
  const area = $('.chat');
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-bot';
  wrap.innerHTML = `<div class="bubble" role="status">${text}</div>`;
  area.appendChild(wrap);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  return wrap;
}
function addUser(text){
  const area = $('.chat');
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-user';
  wrap.innerHTML = `<div class="bubble">${text}</div>`;
  area.appendChild(wrap);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  return wrap;
}

function showThinking(){
  return addBot('... pensando');
}

function showAcessorios(){
  const sec = $('#acessorios-sec');
  const list = $('#acessorios-list');
  list.innerHTML = '';
  ACESSORIOS.forEach(a => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.setAttribute('type','button');
    b.setAttribute('aria-pressed','false');
    b.dataset.id = a.id;
    b.textContent = `${a.icon} ${a.nome}`;
    b.addEventListener('click', () => {
      const pressed = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', String(!pressed));
      validateGerar();
    });
    list.appendChild(b);
  });
  sec.classList.remove('hidden');
  validateGerar();
}

function selecionados(){
  return $$('.chip[aria-pressed="true"]').map(x => ({
    id: x.dataset.id,
    nome: x.textContent.trim()
  }));
}

function validateGerar(){
  const btn = $('#btn-gerar');
  btn.disabled = selecionados().length < 1;
}

// Prompt builder (não mostra, apenas cria string para copiar)
function buildPrompt(tema){
  const sel = selecionados();
  const bullets = sel.map(s => `- ${s.nome}`).join('\n');
  const now = new Date().toISOString().slice(0,10);
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

// Resumo do prompt (sem exibir o prompt)
function openResumo(tema){
  const overlay = $('#overlay');
  const modal = $('#resumo-modal');
  const list = $('#resumo-list');
  const sel = selecionados();
  list.innerHTML = sel.map(s => `<li>${s.nome}</li>`).join('') || '<li>—</li>';
  overlay.classList.add('show');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  cleanupTrap = trapFocus(modal);
  $('#copy-btn').onclick = async () => {
    const prompt = buildPrompt(tema);
    const ok = await copyToClipboard(prompt);
    if (ok){
      salvarPrompt(prompt, { tema, mods: sel.map(s=>s.id) });
    }
  };
  $('#close-resumo').onclick = closeResumo;
  $('#go-recentes').onclick = () => location.href = 'recentes.html';
}
function closeResumo(){
  const overlay = $('#overlay');
  const modal = $('#resumo-modal');
  overlay.classList.remove('show');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  if (cleanupTrap) cleanupTrap();
}

// Modal educativo (1x)
function maybeEducativo(){
  const seen = localStorage.getItem('educativo_ok');
  if (seen) return;
  const overlay = $('#overlay');
  const modal = $('#educativo-modal');
  $('#educativo-ok').onclick = () => {
    localStorage.setItem('educativo_ok','true');
    overlay.classList.remove('show');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
  };
  overlay.classList.add('show');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  cleanupTrap = trapFocus(modal);
}

// Settings Drawer
function setupDrawer(){
  const drawer = $('#drawer');
  const btn = $('#btn-settings');
  const close = $('#btn-close-drawer');
  const overlay = $('#overlay');
  const open = () => { drawer.classList.add('open'); btn.setAttribute('aria-expanded','true'); overlay.classList.add('show'); };
  const shut = () => { drawer.classList.remove('open'); btn.setAttribute('aria-expanded','false'); overlay.classList.remove('show'); };
  btn.addEventListener('click', open);
  close.addEventListener('click', shut);
  overlay.addEventListener('click', (e)=>{
    if (!drawer.classList.contains('open')) return;
    // fecha se clicar fora de qualquer modal ativo
    if (!$('#resumo-modal')?.classList.contains('hidden')) return;
    if (!$('#educativo-modal')?.classList.contains('hidden')) return;
    shut();
  });
}

// SW register
function registerSW(){
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(console.error);
  }
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
  // Saudação inicial
  addBot(`${saudacao()}! Vamos criar um prompt top pra você.`);
  addBot('Qual o tema? Ex.: Danos estéticos relacionados a acidentes de trabalho');

  // Composer
  const input = $('#tema-input');
  const form  = $('#tema-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tema = input.value.trim().slice(0,180);
    if (!tema){ input.focus(); return; }
    addUser(tema);
    input.value = '';

    const think = showThinking();
    // Simula processamento curto
    await new Promise(r=>setTimeout(r, 1200));
    think.remove();
    addBot('Legal! Agora escolha o que quer incluir no seu prompt. (mín: 1)');

    showAcessorios();

    // tenta sugestões opcionais do KB (não bloqueia)
    buscarSugestoesTema(tema).then(sugs => {
      if (!sugs || sugs.length < 3) return;
      const sec = $('#sugestoes-sec');
      const ul = $('#sugestoes-list');
      ul.innerHTML = '';
      sugs.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.titulo} — ${s.resumo || ''}`.trim();
        ul.appendChild(li);
      });
      sec.classList.remove('hidden');
    }).catch(()=>{});

    // Habilita o botão Gerar
    const gerar = $('#btn-gerar');
    gerar.onclick = () => openResumo(tema);
    $('.bloco-gerar').classList.remove('hidden');
  });

  // Drawer + SW + educativo
  setupDrawer();
  registerSW();
  maybeEducativo();
});
