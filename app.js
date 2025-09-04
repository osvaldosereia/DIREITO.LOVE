import { $, $$, toast, copyToClipboard, trapFocus } from './js/utils.js';
import { ACESSORIOS } from './js/data-acessorios.js';
import { buscarSugestoesTema } from './js/busca-legislacao.js';
import { salvarPrompt } from './js/recents.js';

let cleanupTrap = null;

function saudacao(){
  const h = new Date().getHours();
  if (h >= 1 && h <= 5) return 'Noooite, acordado ainda?!';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Chat helpers
function clearChat(){ const area = $('#chat'); area.innerHTML = ''; }
function scrollToEl(el){
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}
function addBot(text){
  const area = $('#chat');
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-bot';
  wrap.innerHTML = `<div class="bubble" role="status">${text}</div>`;
  area.appendChild(wrap);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  return wrap;
}
function addUser(text){
  const area = $('#chat');
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-user';
  wrap.innerHTML = `<div class="bubble">${text}</div>`;
  area.appendChild(wrap);
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  return wrap;
}
function showThinking(){ return addBot('... pensando'); }

function showAcessorios(){
  const sec = $('#acessorios-sec'); const list = $('#acessorios-list');
  list.innerHTML = '';
  ACESSORIOS.forEach(a => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.setAttribute('aria-pressed','false');
    b.dataset.id = a.id;
    b.textContent = a.nome;
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
  return $$('.chip[aria-pressed="true"]').map(x => ({ id:x.dataset.id, nome:x.textContent.trim() }));
}
function validateGerar(){ $('#btn-gerar').disabled = selecionados().length < 1; }

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

function openResumo(tema){
  scrollToEl(document.body);
  const overlay = $('#overlay'); const modal = $('#resumo-modal'); const list = $('#resumo-list');
  const sel = selecionados();
  list.innerHTML = sel.map(s => `<li>${s.nome}</li>`).join('') || '<li>—</li>';
  overlay.classList.add('show'); modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  cleanupTrap = trapFocus(modal);
 $('#copy-btn').onclick=async()=>{
  const prompt=buildPrompt(tema);

  // salva sempre
  salvarPrompt(prompt,{ tema, mods:sel.map(s=>s.id) });

  // tenta copiar
  const ok = await copyToClipboard(prompt);
  if(ok){
    toast('✅ Copiado e salvo em Recentes');
  } else {
    toast('⚠ Salvo em Recentes, mas não copiado');
  }
};
  $('#close-resumo').onclick = closeResumo;
  $('#go-recentes').onclick = () => location.href = 'recentes.html';
}
function closeResumo(){
  const overlay = $('#overlay'); const modal = $('#resumo-modal');
  overlay.classList.remove('show'); modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true');
  if (cleanupTrap) cleanupTrap();
}

function maybeEducativo(){
  if (localStorage.getItem('educativo_ok')) return;
  const overlay = $('#overlay'); const modal = $('#educativo-modal');
  $('#educativo-ok').onclick = () => {
    localStorage.setItem('educativo_ok','true');
    overlay.classList.remove('show'); modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true');
  };
  overlay.classList.add('show'); modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  cleanupTrap = trapFocus(modal);
}

function setupDrawer(){
  const drawer = $('#drawer'); const btn = $('#btn-settings'); const close = $('#btn-close-drawer'); const overlay = $('#overlay');
  const open = () => { drawer.classList.add('open'); btn.setAttribute('aria-expanded','true'); overlay.classList.add('show'); };
  const shut = () => { drawer.classList.remove('open'); btn.setAttribute('aria-expanded','false'); overlay.classList.remove('show'); };
  btn.addEventListener('click', open); close.addEventListener('click', shut);
  overlay.addEventListener('click', () => {
    if (!drawer.classList.contains('open')) return;
    if (!$('#resumo-modal')?.classList.contains('hidden')) return;
    if (!$('#educativo-modal')?.classList.contains('hidden')) return;
    shut();
  });
}

function registerSW(){
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(console.error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  addBot(`${saudacao()}! Vamos criar um prompt top pra você.`);
  addBot('Qual o tema? Ex.: Danos estéticos relacionados a acidentes de trabalho');

  const input = $('#tema-input'); const form = $('#tema-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tema = input.value.trim().slice(0,180);
    if (!tema){ input.focus(); return; }

    // Reset total para novo tema
    clearChat();
    $('#acessorios-sec').classList.add('hidden');
    $('#sugestoes-sec').classList.add('hidden');
    $('#sugestoes-list').innerHTML = '';
    $$('.chip[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed','false'));

    addUser(tema); input.value = '';
    const think = showThinking();
    await new Promise(r => setTimeout(r, 1000));
    think.remove();
    addBot('Legal! Agora escolha o que quer incluir no seu prompt. (mín: 1)');
    showAcessorios();
    scrollToEl($('#acessorios-sec'));

    // Sugestões do KB (não bloqueia a UI)
    buscarSugestoesTema(tema).then(sugs => {
      if (!sugs || !sugs.length) return; // mostra com 1+
      $('#lbl-sugestoes').textContent = `Sugestões (${sugs.length})`;
      const sec = $('#sugestoes-sec'); const ul = $('#sugestoes-list');
      ul.innerHTML = '';
      sugs.forEach(s=>{
  const b = document.createElement('button');
  b.className = 'chip'; 
  b.type = 'button';
  b.setAttribute('aria-pressed','false');
  b.dataset.id = `sug-${s.titulo}`; // cria um id único
  b.textContent = s.titulo;

  // Quando clicar → alterna entre marcado/desmarcado
  b.addEventListener('click',()=>{
    const pressed = b.getAttribute('aria-pressed') === 'true';
    b.setAttribute('aria-pressed', String(!pressed));
    validateGerar(); // revalida o botão "Gerar"
  });

  ul.appendChild(b);
});

      sec.classList.remove('hidden');
        }).catch(() => { /* silencioso */ });
        const gerar = $('#btn-gerar');
    gerar.onclick = () => {
      const prompt = buildPrompt(tema);

      // salva já no momento de Gerar
      salvarPrompt(prompt,{ tema, mods:selecionados().map(s=>s.id) });

      openResumo(tema);
    };

    $('.bloco-gerar').classList.remove('hidden');
    scrollToEl($('.bloco-gerar'));
  }); // fecha o form.addEventListener

  setupDrawer();
  registerSW();
  maybeEducativo();
}); // fecha o window.addEventListener
