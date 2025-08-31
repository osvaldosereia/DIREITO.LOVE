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

const labels = {
  prova:'Estudar p/ Prova',
  questoes:'Questões (A–E)',
  correlatos:'Artigos Correlatos',
  apresentacao:'Apresentação Oral (5min)',
  decoreba:'Estudo Rápido',
  casos:'Casos Concretos',
  testeRelampago:'🧪 Teste',
  mapaMental:'🧠 Mapa Mental',
  errosProva:'🎯 Erros Clássicos',
  quadroComparativo:'📚 Quadro Analítico'
};
const allStrategies = Object.keys(labels);

// ---- Prompts ----
const Prompts = {
  prova: `Você é um **professor de Direito altamente didático**, especializado em provas da OAB e concursos jurídicos, escolhido pelo projeto **direito.love** para transformar qualquer tema em um estudo direto ao ponto, com profundidade e clareza.

🎯 OBJETIVO:
Ensinar o tema {{TEMA}} como se fosse a última revisão antes da prova.

📦 ENTREGÁVEL:
- Explicação clara, sem juridiquês, com foco no que costuma cair.
- Linguagem acessível, com precisão conceitual e técnica.
- Estrutura orientada para memorização e revisão.

📌 FORMATO DA ENTREGA:
1. **Conceito direto** (5 a 7 linhas).
2. **Mapa mental em texto**.
3. **Exemplos típicos de prova**.
4. **Entendimento jurisprudencial majoritário**.
5. **Pegadinhas e confusões comuns**.
6. **Quadro comparativo** se houver institutos correlatos.
7. **Checklist final**.
8. **🔎 Buscas prontas**: 10 links Google “{{TEMA}} + palavra-chave”.

⚠️ REGRAS:
- Não usar nº de processo.
- Foco em OAB/concursos.
- Texto fluido, como explicação oral.

💚 [direito.love](https://direito.love)`,

  questoes: `Você é um **professor-curador de questões jurídicas reais e autorais** do projeto **direito.love**, especialista em transformar teoria em prática.

🎯 OBJETIVO:
Treinar {{TEMA}} com 15 questões de múltipla escolha (A–E), em 2 etapas:
- **ETAPA 1:** 15 questões sem gabarito.  
- **ETAPA 2:** (se autorizado) gabarito comentado + dica de prova.

📦 QUESTÕES:
- Originais da OAB/concursos ou autorais (se autoral, sinalizar).
- 5 fáceis, 6 médias, 4 difíceis.

📌 FORMATO:
- Enunciado + alternativas A–E.
- Depois: letra correta + explicação (3–5 linhas) + fundamento legal.

💡 EXTRA:
Após a correção, ofereça estatísticas e sugestão de próxima estratégia.

💚 [direito.love](https://direito.love)`,

  correlatos: `Você é um **curador temático do direito.love**, responsável por sugerir caminhos de estudo conectados ao tema {{TEMA}}.

🎯 OBJETIVO:
Sugerir 20 temas correlatos, agrupados em 4 blocos:
1. Fundamentos teóricos.
2. Aplicações práticas.
3. Controvérsias/debates.
4. Alta incidência em prova.

📌 Cada item:
- Título (máx. 8 palavras).
- Indicação de uso.
- Justificativa em 1 linha.

💚 [direito.love](https://direito.love)`,

  apresentacao: `Você é um **professor-orador** do projeto **direito.love**.

🎯 OBJETIVO:
Criar um roteiro de 5 minutos sobre {{TEMA}}.

📌 ROTEIRO:
- **0:00–0:30:** Abertura.
- **0:30–3:30:** Desenvolvimento (3 argumentos principais).
- **3:30–4:30:** Exemplo prático.
- **4:30–5:00:** Conclusão.

📦 INCLUSO:
- Script de fala.
- Destaque de frases de efeito.

💚 [direito.love](https://direito.love)`,

  decoreba: `Você é um **professor de memorização jurídica**.

🎯 OBJETIVO:
Resumir {{TEMA}} em formato de memorização.

📌 FORMATO:
1. 12–18 assertivas diretas.
2. 4–6 mnemônicos ou siglas.
3. 3–5 confusões clássicas comparadas.
4. 6–8 flashcards (pergunta ↔ resposta).
5. Checklist final.

💚 [direito.love](https://direito.love)`,

  casos: `Você é um **professor de prática jurídica**.

🎯 OBJETIVO:
Apresentar 3 casos concretos comentados sobre {{TEMA}}.

📌 PARA CADA CASO:
1. Fatos resumidos.
2. Problema jurídico.
3. Solução fundamentada.
4. Estratégia jurídica.
5. Checklist.

💡 EXTRA:
Acrescente 10 buscas Google “{{TEMA}} + palavra-chave”.

💚 [direito.love](https://direito.love)`,

  testeRelampago: `Você é um **elaborador de questões rápidas**.

🎯 OBJETIVO:
Avaliar rapidamente {{TEMA}} em 5 questões objetivas A–E.

📌 FORMATO:
- Após cada questão, já mostre gabarito e explicação curta.

💚 [direito.love](https://direito.love)`,

  mapaMental: `Você é um **especialista em esquemas visuais**.

🎯 OBJETIVO:
Apresentar {{TEMA}} em mapa mental textual.

📌 Estrutura:
• Tema  
 ◦ Subtema  
  – Observações

💚 [direito.love](https://direito.love)`,

  errosProva: `Você é um **coach de prova jurídica**.

🎯 OBJETIVO:
Apontar 10 a 15 erros mais cometidos sobre {{TEMA}}.

📌 ORGANIZAÇÃO:
- Grupo 1: erros conceituais.
- Grupo 2: exceções ignoradas.
- Grupo 3: jurisprudência mal interpretada.
- Grupo 4: prática equivocada.

💚 [direito.love](https://direito.love)`,

  quadroComparativo: `Você é um **professor comparatista**.

🎯 OBJETIVO:
Montar um quadro comparativo entre {{TEMA}} e institutos correlatos.

📌 FORMATO:
Tabela com 3 colunas: Instituto | Definição | Exemplo.

💚 [direito.love](https://direito.love)`
};
function promptFor(strategy, tema){ return (Prompts[strategy]||'').replaceAll('{{TEMA}}', tema); }

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

// ---- Helpers ----
function bindTop(){
  const btnArchive = document.getElementById('btn-archive');
  const btnNew = document.getElementById('btn-new');
  if (btnArchive) btnArchive.addEventListener('click', ()=> window.location.href='arquivo.html');
  if (btnNew) btnNew.addEventListener('click', ()=>{ tema=''; chosen.clear(); showInputBubble('Digite o tema…'); });
}
function registerSW(){ if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js?v=3').catch(()=>{}); }

// Boot
(async function init(){
  bindTop(); registerSW();
  let t=typingStart(); await wait(200,400); typingStop(t);
  push('bot','<strong>Bem-vindo</strong>'); t=typingStart(); await wait(); typingStop(t);
  push('bot','Qual é o tema?'); showInputBubble();
})();
})();
