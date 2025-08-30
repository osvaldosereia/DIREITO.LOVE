
// ====== ONLINE/OFFLINE STATE ======
function setOnlineUI(isOnline){
  document.body.dataset.online = isOnline ? "1" : "0";
  document.querySelectorAll("[data-require-online]").forEach(btn=>btn.disabled = !isOnline);
}
setOnlineUI(navigator.onLine);
window.addEventListener("online", ()=>setOnlineUI(true));
window.addEventListener("offline", ()=>setOnlineUI(false));

// ====== QUEUE: OPEN IA WHEN ONLINE ======
const OPEN_QUEUE_KEY = "dlove_open_queue";
function enqueueOpen(url){
  const q = JSON.parse(localStorage.getItem(OPEN_QUEUE_KEY) || "[]");
  q.push({url, ts: Date.now()});
  localStorage.setItem(OPEN_QUEUE_KEY, JSON.stringify(q));
}
function tryFlushQueue(){
  if(!navigator.onLine) return;
  const q = JSON.parse(localStorage.getItem(OPEN_QUEUE_KEY) || "[]");
  while(q.length){
    const {url} = q.shift();
    window.open(url, "_blank");
  }
  localStorage.setItem(OPEN_QUEUE_KEY, JSON.stringify(q));
}
window.addEventListener("online", tryFlushQueue);

// ====== HISTORY / FAVORITES ======
const HKEY = "dlove_history";
function saveHistory(item){
  const data = JSON.parse(localStorage.getItem(HKEY) || "[]");
  data.unshift({...item, id: crypto.randomUUID(), savedAt: new Date().toISOString()});
  localStorage.setItem(HKEY, JSON.stringify(data.slice(0,200)));
  renderHistory();
}
function getHistory(){
  try { return JSON.parse(localStorage.getItem(HKEY) || "[]"); }
  catch(e){ return []; }
}
function exportJSON(){
  const blob = new Blob([localStorage.getItem(HKEY) || "[]"], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "direito-love-historico.json";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function importJSON(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const arr = JSON.parse(reader.result);
      if(Array.isArray(arr)){
        localStorage.setItem(HKEY, JSON.stringify(arr));
        renderHistory();
        alert("Arquivo importado com sucesso.");
      }else{
        alert("Arquivo inválido.");
      }
    }catch(e){ alert("Erro ao ler JSON."); }
  };
  reader.readAsText(file);
}

// ====== PROMPT GENERATION ======
const strategyPrompts = {
  "erros": (tema)=>`Você é um professor de Direito. Liste de forma objetiva as **5–7 pegadinhas e erros que mais reprovam** sobre **${tema}**. 
Para cada item: (1) enuncie o erro do aluno, (2) explique o entendimento correto em 2 linhas, (3) dê um exemplo rápido. Linguagem simples, sem REsp/AREsp/nº.
Finalize com uma dica-mnemônica curta.`,
  "mapa": (tema)=>`Construa um **Mapa Mental em Markdown** sobre **${tema}**, com:
- Nós principais (conceitos-chave)
- Relações de causa-consequência
- Exceções e observações
- Palavras-chave (em itálico)
Formate com bullets e sub-bullets, título único e blocos bem organizados.`,
  "quadro": (tema)=>`Monte um **Quadro Comparativo** em tabela (Markdown) sobre **${tema}**, com 3 colunas: Instituto | Definição objetiva | Exemplo-chave.
Inclua pelo menos 5 linhas de comparação relevantes ao tema.`,
  "peca": (tema)=>`Elabore uma **minipeça processual** sobre **${tema}** (petição ou parecer), com estrutura: Endereçamento, Qualificação sintética, Fatos resumidos, Fundamentação (entendimentos majoritários), Pedidos, Fecho. Linguagem clara e objetiva.`,
  "flashcards": (tema)=>`Gere **12 flashcards** de estudo sobre **${tema}**. Para cada card: Frente = pergunta objetiva; Verso = resposta curta e direta. Varie entre conceito, exceção e exemplo prático.`,
  "sprint": (tema)=>`Crie um pacote de **Sprint 15’** sobre **${tema}** com 3 blocos:
1) Resumo didático (6–8 linhas) 
2) 3 questões objetivas (A–D) com gabarito ao final
3) 1 pegadinha clássica explicada em 3 linhas.`,
  "decoreba": (tema)=>`Liste **20 assertivas curtíssimas** (1 frase cada) para **decoreba** sobre **${tema}**. Sem detalhes, apenas o essencial (definições, prazos, princípios).`
};

function genPrompt(){
  const tema = document.querySelector("#tema").value.trim();
  const strategy = document.querySelector("#estrategia").value;
  if(!tema){ alert("Informe o tema."); return; }
  let body = strategyPrompts[strategy] ? strategyPrompts[strategy](tema) :
    `Explique de forma didática e organizada o tema **${tema}**.`;
  const out = document.querySelector("#output");
  out.value = body;
  saveHistory({tema, strategy, body});
}

function copyPrompt(){
  const out = document.querySelector("#output");
  out.select(); document.execCommand("copy");
  const toast = document.querySelector("#toast");
  toast.textContent = "✅ Prompt copiado!";
  toast.style.display = "block";
  setTimeout(()=>toast.style.display="none", 1200);
}

function openIA(which){
  const text = document.querySelector("#output").value.trim();
  if(!text){ alert("Gere um prompt antes."); return; }
  // Simple mapper (encode in URL fragment/query)
  const encoded = encodeURIComponent(text);
  let url = "https://chat.openai.com/"; // fallback
  if(which==="chatgpt") url = `https://chat.openai.com/?q=${encoded}`;
  if(which==="gemini") url = `https://gemini.google.com/app?hl=pt-BR&query=${encoded}`;
  if(which==="perplexity") url = `https://www.perplexity.ai/?q=${encoded}`;
  if(navigator.onLine){
    window.open(url, "_blank");
  }else{
    enqueueOpen(url);
    alert("Sem conexão agora. Já deixei na fila e abro assim que a internet voltar.");
  }
}

async function sharePrompt(){
  const text = document.querySelector("#output").value.trim();
  if(!text){ alert("Nada para compartilhar."); return; }
  if(navigator.share){
    try{
      await navigator.share({title:"direito.love — Prompt", text});
    }catch(e){ /* cancelado */ }
  }else{
    alert("Compartilhamento nativo indisponível neste dispositivo.");
  }
}

// ====== HISTORY RENDER ======
function renderHistory(){
  const wrap = document.querySelector("#history");
  const data = getHistory();
  wrap.innerHTML = data.map(item => `
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="badge">${new Date(item.savedAt).toLocaleString()}</div>
        <div class="badge">${item.strategy}</div>
      </div>
      <strong>${item.tema}</strong>
      <pre style="white-space:pre-wrap">${item.body.slice(0,500)}${item.body.length>500?"…":""}</pre>
      <div class="row">
        <button class="btn" onclick="document.querySelector('#output').value=\`${item.body.replace(/`/g,'\\`')}\`">Recarregar no editor</button>
      </div>
    </div>
  `).join("") || `<div class="muted">Sem histórico por enquanto.</div>`;
}
renderHistory();

// ====== SPRINT (15 MIN) ======
let sprintInterval=null, sprintRemaining=15*60;
function formatTime(s){const m = Math.floor(s/60), ss = String(s%60).padStart(2,"0"); return `${m}:${ss}`;}
function startSprint(){
  sprintRemaining = 15*60;
  updateSprintUI();
  clearInterval(sprintInterval);
  sprintInterval = setInterval(()=>{
    sprintRemaining--;
    updateSprintUI();
    if(sprintRemaining<=0){ clearInterval(sprintInterval); alert("Sprint finalizada!"); }
  }, 1000);
}
function updateSprintUI(){
  document.querySelector("#timer").textContent = formatTime(sprintRemaining);
}
function toggleChecklist(cb){ cb.parentElement.classList.toggle("done", cb.checked); }

// ====== DECOREBA (diferenciado) ======
let decoreba = [];
function buildDecoreba(){
  const tema = document.querySelector("#tema").value.trim() || "tema escolhido";
  // placeholders até a IA gerar as assertivas com o prompt "decoreba"
  decoreba = Array.from({length: 12}).map((_,i)=>({text:`[${i+1}] Regra essencial de ${tema}`, known:false}));
  renderDecoreba();
}
function renderDecoreba(){
  const wrap = document.querySelector("#decorebaList");
  wrap.innerHTML = decoreba.map((it,idx)=>`
    <div class="row" style="align-items:center;justify-content:space-between;border:1px dashed var(--border);border-radius:10px;padding:8px">
      <span>${it.text}</span>
      <button class="btn" onclick="toggleKnown(${idx})">${it.known?"✔️ Lembrei":"❓ Não sei"}</button>
    </div>
  `).join("");
}
function toggleKnown(i){
  decoreba[i].known = !decoreba[i].known; renderDecoreba();
}

// ====== FLASHCARDS (offline) ======
let cards = [];
function buildFlashcards(){
  const tema = document.querySelector("#tema").value.trim() || "tema";
  cards = Array.from({length:8}).map((_,i)=>({q:`Pergunta ${i+1} sobre ${tema}?`, a:`Resposta curta ${i+1}.`, flipped:false}));
  renderCards();
}
function flipCard(i){ cards[i].flipped = !cards[i].flipped; renderCards(); }
function renderCards(){
  const wrap = document.querySelector("#flashcards");
  wrap.innerHTML = cards.map((c,i)=>`
    <div class="flashcard" onclick="flipCard(${i})">
      <strong>${c.flipped? "Resposta" : "Pergunta"}</strong>
      <div>${c.flipped ? c.a : c.q}</div>
    </div>
  `).join("");
}

// ====== SERVICE WORKER REG ======
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("./sw.js");
  });
}
