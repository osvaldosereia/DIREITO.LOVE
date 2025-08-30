
function $(s, root=document){ return root.querySelector(s); }
function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

const chat = $(".chat");
const input = $("#chat-input");
const sendBtn = $("#send");
const typing = $("#typing");
const HKEY = "dlove_history_v2";


function removeCurrentPrompt(){
  const ta = document.querySelector("#prompt");
  if(!ta) return;
  const bubble = ta.closest(".msg"); // whole bot message
  if(bubble && bubble.parentElement){
    bubble.remove();
  }else{
    // fallback: remove only the container around the textarea
    ta.parentElement?.parentElement?.remove();
  }
}
const themeState = { 
  tema: "", 
  currentStrategy: null, 
  remaining: ["APRENDER","ESTUDAR COM QUESTÕES","TEMAS CORRELATOS","APRESENTAÇÃO ORAL (5 min)","DECOREBA","CASOS CONCRETOS"]
};

function nowGreeting(){
  const h = new Date().getHours();
  if(h>=1 && h<=5) return "Noooite, acordado ainda?";
  if(h<12) return "Bom dia";
  if(h<18) return "Boa tarde";
  return "Boa noite";
}

// history utils
function getHistory(){ try{ return JSON.parse(localStorage.getItem(HKEY) || "[]"); }catch(e){ return []; } }
function setHistory(arr){ localStorage.setItem(HKEY, JSON.stringify(arr)); }
function addHistory(item){
  const data = getHistory();
  data.unshift(item);
  setHistory(data.slice(0,300));
}

// --- Message helpers ---
function pushBot(html){
  const m = el("div","msg bot");
  const avatar = el("div","avatar");
  const bubble = el("div","bubble");
  bubble.innerHTML = html;
  m.append(avatar, bubble);
  chat.append(m);
  chat.scrollTop = chat.scrollHeight;
}
function pushUser(text){
  const m = el("div","msg user");
  const bubble = el("div","bubble");
  bubble.textContent = text;
  m.append(bubble);
  chat.append(m);
  chat.scrollTop = chat.scrollHeight;
}
function showTyping(show=true){
  typing.classList.toggle("hidden", !show);
  chat.scrollTop = chat.scrollHeight;
}
async function botSay(text, delay=700){
  showTyping(true);
  await new Promise(r=>setTimeout(r, delay + Math.floor(Math.random()*500)));
  pushBot(text);
  showTyping(false);
}

// --- Flow ---
function resetConversation(){
  chat.innerHTML = "";
  themeState.tema = "";
  themeState.currentStrategy = null;
  themeState.remaining = ["APRENDER","ESTUDAR COM QUESTÕES","TEMAS CORRELATOS","APRESENTAÇÃO ORAL (5 min)","DECOREBA","CASOS CONCRETOS"];
  intro();
}

async function intro(){
  await botSay(`<strong>${nowGreeting()}!</strong>`);
  await botSay("Vamos lá, vou criar um prompt top pra você.");
  await botSay(`Qual o tema? <em>Ex.: Danos estéticos relacionados a acidentes de trabalho</em>`);
  $("#composer").classList.remove("hidden");
  input.focus();
}

function renderStrategyChips(){
  const row = el("div","options");
  themeState.remaining.forEach(name=>{
    const b = el("button","option");
    b.textContent = name;
    b.onclick = ()=> chooseStrategy(name);
    row.appendChild(b);
  });
  return row;
}

async function chooseStrategy(name){
  themeState.currentStrategy = name;
  await botSay("Legal, me dá um segundo, já te entrego o prompt pronto.");
  const promptText = buildPrompt(name, themeState.tema);
  await botSay(`
    <div>
      <div class="badges">
        <span class="badge">Prompt — ${name}</span>
      </div>
      <div style="margin-top:6px">
        <textarea id="prompt" style="width:100%;min-height:140px">${promptText}</textarea>
      </div>
      <div class="options" style="margin-top:8px">
        <button class="btn" id="copy-btn">📋 Copiar</button>
        <button class="btn" id="btn-cgpt" data-ia="chatgpt"><img class="ia-ico" src="icons/chatgpt.svg" alt="ChatGPT"> ChatGPT</button>
        <button class="btn" id="btn-gemini" data-ia="gemini"><img class="ia-ico" src="icons/gemini.svg" alt="Gemini"> Gemini</button>
        <button class="btn" id="btn-perp" data-ia="perplexity"><img class="ia-ico" src="icons/perplexity.svg" alt="Perplexity"> Perplexity</button>
      </div>
    </div>
  `, 900);

  $("#copy-btn").onclick = () => {
    const ta = $("#prompt"); ta.select(); document.execCommand("copy");
    removeCurrentPrompt();
    pushBot("✅ Prompt copiado com sucesso!");
    showRemaining();
  };
  ["btn-cgpt","btn-gemini","btn-perp"].forEach(id=>{
    const btn = $("#"+id);
    if(btn) btn.onclick = ()=> openIA(btn.dataset.ia);
  });

  // Save to history immediately
  addHistory({
    id: crypto.randomUUID(),
    tema: themeState.tema,
    strategy: name,
    body: promptText,
    date: new Date().toISOString(),
    used: [] // which IAs were opened
  });
}

function buildPrompt(strategy, tema){
  switch(strategy){
    case "APRENDER":
      return `Você é um professor de Direito (OAB/concursos). Explique **${tema}** de forma didática e detalhada, com: conceito direto, exemplos práticos, entendimentos majoritários (sem REsp/AREsp/nº), pegadinhas e mini-resumo. Linguagem simples.`;
    case "ESTUDAR COM QUESTÕES":
      return `Monte **15 questões objetivas** de alto nível sobre **${tema}** (priorize OAB/concursos reais; se criar, avise). Gabarito **apenas ao final**. Traga comentários curtos e pegadinhas clássicas.`;
    case "TEMAS CORRELATOS":
      return `Liste **20 temas correlatos** a **${tema}** (bem variados). Organize por subáreas e traga 1 linha de foco de estudo para cada.`;
    case "APRESENTAÇÃO ORAL (5 min)":
      return `Crie um **roteiro de 5 minutos** para apresentar **${tema}**: abertura, 3 pontos centrais (com exemplo), 1 controvérsia, fechamento com call to action.`;
    case "DECOREBA":
      return `Liste **20 assertivas curtíssimas** para decorar sobre **${tema}** (definições, prazos, princípios). Sem detalhes; 1 linha cada.`;
    case "CASOS CONCRETOS":
      return `Traga **3 casos concretos** sobre **${tema}** (enunciado curto), com análise passo a passo (fundamentos majoritários) e conclusão objetiva.`;
    default:
      return `Explique **${tema}** de forma clara e memorável.`;
  }
}

function showRemaining(){
  themeState.remaining = themeState.remaining.filter(s=>s!==themeState.currentStrategy);
  if(themeState.remaining.length){
    pushBot("Quer gerar o mesmo tema com outra estratégia? Escolha abaixo:");
    const chips = renderStrategyChips();
    const m = el("div","msg bot");
    const avatar = el("div","avatar");
    const bubble = el("div","bubble"); bubble.append(chips);
    m.append(avatar,bubble); chat.append(m); chat.scrollTop = chat.scrollHeight;
  }else{
    pushBot("Todas as estratégias foram usadas. Digite “nova” para novo tema.");
  }
}

function openIA(which){
  const ta = $("#prompt"); if(!ta) return;
  const text = encodeURIComponent(ta.value);
  let url = "https://chat.openai.com/";
  if(which==="chatgpt") url = `https://chat.openai.com/?q=${text}`;
  if(which==="gemini") url = `https://gemini.google.com/app?hl=pt-BR&query=${text}`;
  if(which==="perplexity") url = `https://www.perplexity.ai/?q=${text}`;
  window.open(url, "_blank");
  removeCurrentPrompt();
  pushBot("✅ Prompt copiado com sucesso!");
  // mark in history the IA used (for the latest item with same prompt)
  const data = getHistory();
  for(const it of data){
    if(it.body === $("#prompt").value){
      if(!Array.isArray(it.used)) it.used = [];
      if(!it.used.includes(which)) it.used.push(which);
      break;
    }
  }
  setHistory(data);
  showRemaining();
}

// --- Input Handlers ---
sendBtn.addEventListener("click", onSend);
input.addEventListener("keydown", e=>{ if(e.key==="Enter"){ onSend(); }});

function onSend(){
  const val = input.value.trim(); if(!val) return;
  pushUser(val); input.value="";
  if(!themeState.tema){
    themeState.tema = val;
    botSay("Pronto, é só clicar para copiar e depois colar na sua I.A. preferida.").then(()=>{
      const m = el("div","msg bot");
      const avatar = el("div","avatar");
      const bubble = el("div","bubble"); bubble.append(renderStrategyChips());
      m.append(avatar,bubble); chat.append(m); chat.scrollTop = chat.scrollHeight;
    });
  }else{
    if(val.toLowerCase().includes("nova")){
      botSay("Vamos lá, qual o novo tema?");
      themeState.tema=""; themeState.currentStrategy=null;
    }
  }
}

// --- Arquivo modal ---
function openArchive(){
  const modal = $("#arquivoModal"); const body = $("#arquivoTable tbody");
  const data = getHistory();
  body.innerHTML = data.map(item=>`
    <tr>
      <td>${new Date(item.date).toLocaleString()}</td>
      <td>${item.tema}</td>
      <td>${item.strategy}</td>
      <td>
        <div class="row">
          <button class="btn" onclick="loadFromArchive('${item.id}')">Carregar</button>
          <button class="btn" title="Abrir no ChatGPT" onclick="openFromArchive('${item.id}','chatgpt')"><img class="ia-ico" src="icons/chatgpt.svg" alt="ChatGPT"></button>
          <button class="btn" title="Abrir no Gemini" onclick="openFromArchive('${item.id}','gemini')"><img class="ia-ico" src="icons/gemini.svg" alt="Gemini"></button>
          <button class="btn" title="Abrir no Perplexity" onclick="openFromArchive('${item.id}','perplexity')"><img class="ia-ico" src="icons/perplexity.svg" alt="Perplexity"></button>
        </div>
        <div class="small">Usou: ${(item.used||[]).map(x=>x).join(", ") || "—"}</div>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="4">Sem itens no arquivo ainda.</td></tr>`;
  modal.style.display="flex";
}
function closeArchive(){ $("#arquivoModal").style.display="none"; }
function loadFromArchive(id){
  const data = getHistory();
  const item = data.find(x=>x.id===id); if(!item) return;
  pushBot(`<div><div class="badges"><span class="badge">Prompt — ${item.strategy}</span></div>
  <div style="margin-top:6px"><textarea id="prompt" style="width:100%;min-height:140px">${item.body}</textarea></div>
  <div class="options" style="margin-top:8px">
    <button class="btn" id="copy-btn">📋 Copiar</button>
    <button class="btn" onclick="openIA('chatgpt')"><img class="ia-ico" src="icons/chatgpt.svg" alt="ChatGPT"> ChatGPT</button>
    <button class="btn" onclick="openIA('gemini')"><img class="ia-ico" src="icons/gemini.svg" alt="Gemini"> Gemini</button>
    <button class="btn" onclick="openIA('perplexity')"><img class="ia-ico" src="icons/perplexity.svg" alt="Perplexity"> Perplexity</button>
  </div></div>`);
  const copyBtn = $("#copy-btn"); if(copyBtn) copyBtn.onclick = () => { const ta=$("#prompt"); ta.select(); document.execCommand("copy"); pushBot("✅ Prompt copiado com sucesso!"); };
  closeArchive();
}
function openFromArchive(id, which){
  const data = getHistory();
  const item = data.find(x=>x.id===id); if(!item) return;
  const encoded = encodeURIComponent(item.body);
  let url="https://chat.openai.com/";
  if(which==="chatgpt") url=`https://chat.openai.com/?q=${encoded}`;
  if(which==="gemini") url=`https://gemini.google.com/app?hl=pt-BR&query=${encoded}`;
  if(which==="perplexity") url=`https://www.perplexity.ai/?q=${encoded}`;
  window.open(url,"_blank");
  if(!Array.isArray(item.used)) item.used=[];
  if(!item.used.includes(which)) item.used.push(which);
  setHistory(data);
}

function newSearch(){ resetConversation(); }


// Prefill from arquivo.html selection (if any)
(function(){
  try{
    const raw = localStorage.getItem("dlove_prefill");
    if(!raw) return;
    const item = JSON.parse(raw);
    localStorage.removeItem("dlove_prefill");
    // Simulate showing the prompt directly
    document.addEventListener("DOMContentLoaded", async ()=>{
      const chat = document.querySelector(".chat");
      function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }
      function pushBot(html){
        const m = el("div","msg bot"); const avatar = el("div","avatar"); const bubble = el("div","bubble");
        bubble.innerHTML = html; m.append(avatar,bubble); chat.append(m); chat.scrollTop = chat.scrollHeight;
      }
      // set theme
      if(item.tema) { window.themeState.tema = item.tema; }
      // render prompt directly
      pushBot(`<div><div class="badges"><span class="badge">Prompt — ${item.strategy}</span></div>
      <div style="margin-top:6px"><textarea id="prompt" style="width:100%;min-height:140px">${item.body}</textarea></div>
      <div class="options" style="margin-top:8px">
        <button class="btn" id="copy-btn">📋 Copiar</button>
        <button class="btn" onclick="openIA('chatgpt')"><img class="ia-ico" src="icons/chatgpt.svg" alt="ChatGPT"> ChatGPT</button>
        <button class="btn" onclick="openIA('gemini')"><img class="ia-ico" src="icons/gemini.svg" alt="Gemini"> Gemini</button>
        <button class="btn" onclick="openIA('perplexity')"><img class="ia-ico" src="icons/perplexity.svg" alt="Perplexity"> Perplexity</button>
      </div></div>`);
      const copyBtn = document.getElementById("copy-btn");
      if(copyBtn) copyBtn.onclick = () => { const ta=document.getElementById("prompt"); ta.select(); document.execCommand("copy"); removeCurrentPrompt(); pushBot("✅ Prompt copiado com sucesso!"); showRemaining(); };
    });
  }catch(e){}
})();

// Init
intro();
