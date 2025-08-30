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

const Prompts = {
  // ... (continuação dos prompts como no código original)
};

// ---- UI helpers ----
function push(role, nodeOrHtml){
  const box = $('#messages');
  const w = el('div', `msg ${role}`);
  const b = el('div', 'bubble');
  if(typeof nodeOrHtml === 'string'){ b.innerHTML = nodeOrHtml; }
  else { b.appendChild(nodeOrHtml); }
  w.appendChild(b); box.appendChild(w);
  box.scrollTop = box.scrollHeight;
  return b;
}

const typingStart = ()=> push('bot', `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`);
const typingStop = (bubble)=>{ if(!bubble) return; const msg=bubble.closest('.msg'); if(msg) msg.remove(); };

// Adicionando os event listeners para os botões flutuantes
document.getElementById('btn-archive').addEventListener('click', () => {
  window.location.href = 'arquivo.html';  // Leva para a página de arquivo
});

document.getElementById('btn-restart').addEventListener('click', () => {
  // Reinicia o processo de pesquisa
  tema = '';
  chosen.clear();
  showInputBubble('Digite o tema…');
});

// Restante do código...
})();
