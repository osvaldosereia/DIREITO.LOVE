(function(){
// ---- State & Utils ----
const LS_KEY='chatBooyArchive';
const $ = s=>document.querySelector(s);
const el = (tag, cls, html)=>{ const x=document.createElement(tag); if(cls) x.className=cls; if(html!=null) x.innerHTML=html; return x; };
const sleep = ms=> new Promise(r=> setTimeout(r, ms));
const wait = (min=700,max=1200)=> matchMedia('(prefers-reduced-motion: reduce)').matches ? Promise.resolve() : sleep(Math.floor(Math.random()*(max-min+1))+min);
const truncate=(t,n=80)=> t.length>n? t.slice(0,n-1)+'…': t;
const lsLoad=()=>{ try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch(e){return[]} };
const lsSave=v=> localStorage.setItem(LS_KEY, JSON.stringify(v));
const archiveAdd=rec=>{ const L=lsLoad(); L.unshift(rec); lsSave(L); };

const labels = {prova:'Estudar p/ Prova', questoes:'Questões (A–E)', correlatos:'Correlatos', apresentacao:'Apresentação (5min)', decoreba:'Decoreba', casos:'Casos concretos', testeRelampago:'🧪 Teste', mapaMental:'🧠 Mapa', errosProva:'🎯 Erros', quadroComparativo:'📚 Quadro'};
const allStrategies = Object.keys(labels);

// ---- UI helpers ----
function push(role, nodeOrHtml){
  const box = $('#messages');
  const w = el('div', `msg ${role}`);
  const b = el('div', 'bubble');
  if(typeof nodeOrHtml === 'string'){ b.innerHTML = nodeOrHtml; }
  else { b.appendChild(nodeOrHtml); }
  w.appendChild(b); box.appendChild(w);
  w.scrollIntoView({behavior:"smooth", block:"end"});
  return b;
}
const typingStart = ()=> push('bot', `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`);
const typingStop = (bubble)=>{ if(!bubble) return; const msg=bubble.closest('.msg'); if(msg) msg.remove(); };

function aiButtons(){
  const URL = {
    chatgpt: 'https://chat.openai.com/',
    gemini: 'https://gemini.google.com/',
    perplexity: 'https://www.perplexity.ai/'
  };

  const wrap = el('div','ai-buttons');

  function mk(name, label){
    const a = document.createElement('a');
    a.className = 'ai-btn';
    a.href = URL[name];         
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    a.setAttribute('aria-label', label);

    a.addEventListener('click', () => {
      setTimeout(() => showRemaining(), 200);
    });
    return a;
  }

  wrap.appendChild(mk('chatgpt','ChatGPT'));
  wrap.appendChild(mk('gemini','Gemini'));
  wrap.appendChild(mk('perplexity','Perplexity'));
  return wrap;
}

// ---- App logic ----
let tema=''; const chosen = new Set();

function renderPromptCard(strategy){
  const card = el('div','prompt-card');
  const h = el('h3','prompt-title', truncate(tema,80));
  const ta = el('textarea'); ta.value = promptFor(strategy, tema);
  const row = el('div','row');

  const copy = el('button','btn'); copy.textContent="Copiar";
  const novo = el('button','btn'); novo.textContent="Reiniciar";

  row.appendChild(copy); row.appendChild(novo);
  card.appendChild(h); card.appendChild(ta); card.appendChild(row);

  copy.addEventListener('click', async ()=>{ 
    await navigator.clipboard.writeText(ta.value);
    archiveAdd({ id:Date.now().toString(36), theme:tema, strategy:strategy, strategyLabel:labels[strategy], prompt:ta.value, createdAt:new Date().toISOString() });
    push('bot','✅ Copiado com sucesso!');
    card.appendChild(aiButtons());
  });
  novo.addEventListener('click', ()=>{ tema=''; chosen.clear(); showInputBubble('Digite um novo tema…'); });
  return card;
}

async function handleStrategy(s){
  chosen.add(s);
  push('user', `<div>${labels[s]}</div>`);
  let t=typingStart(); await wait(); typingStop(t);
  push('bot', `Gerando prompt de <strong>${labels[s]}</strong>…`);
  t=typingStart(); await wait(1000,1600); typingStop(t);
  push('bot', renderPromptCard(s));
  await wait(300,600);
  showRemaining();
}

function showRemaining(){
  const remaining = allStrategies.filter(x=> !chosen.has(x));
  if(!remaining.length){ push('bot','Fechamos todas as estratégias. Quer iniciar uma nova pesquisa?'); return; }
  push('bot', `Quer gerar outro prompt para <strong>${truncate(tema,60)}</strong>? Escolha:`);
  showChips();
}

// Input
function showInputBubble(placeholder='Digite o tema…'){
  const wrap = el('div', 'input-bubble');
  const input = el('input'); input.placeholder=placeholder; input.autocomplete='off';
  const row = el('div','row');
  const send = el('button','iconbtn'); send.title='Enviar'; send.innerHTML='<img src="icons/send.svg" alt=""/>';
  row.appendChild(send); wrap.appendChild(input); wrap.appendChild(row);
  const bubble = push('bot', wrap);

  const submit = async ()=>{ const text = input.value.trim(); if(!text) return input.focus();
    tema = text; bubble.closest('.msg').remove();
    push('user', `<div>${truncate(tema,140)}</div>`);
    let t=typingStart(); await wait(); typingStop(t);
    push('bot', 'Beleza. Vou te mostrar as estratégias disponíveis.');
    await wait(300,700); t=typingStart(); await wait(300,700); typingStop(t);
    push('bot', `O que você quer fazer com <strong>${truncate(tema,60)}</strong>?`);
    await wait(200,500); showChips(); };
  send.addEventListener('click', submit);
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
  input.focus();
}

function showChips(){
  const bar = el('div','chips');
  allStrategies.forEach(s=>{ if(chosen.has(s)) return; const b = el('button','chip', labels[s]); b.addEventListener('click', ()=> handleStrategy(s)); bar.appendChild(b); });
  push('bot', bar);
}

// ---- Helpers que estavam faltando ----
function bindTop(){
  const btnArchive = document.getElementById('btn-archive');
  const btnNew = document.getElementById('btn-new');

  if (btnArchive) {
    btnArchive.addEventListener('click', ()=> window.location.href='arquivo.html');
  }
  if (btnNew) {
    btnNew.addEventListener('click', ()=>{ 
      tema=''; 
      chosen.clear(); 
      showInputBubble('Digite o tema…'); 
    });
  }
}

function registerSW(){
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js?v=3').catch(()=>{});
}

// Boot
(async function init(){
  bindTop(); registerSW();
  let t=typingStart(); await wait(200,400); typingStop(t);
  push('bot','<strong>Bem-vindo</strong>'); t=typingStart(); await wait(); typingStop(t);
  push('bot','Qual é o tema?'); showInputBubble();
})();
})();
