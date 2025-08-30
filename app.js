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
    prova:(tema)=>`Você é um **professor de Direito** (OAB/concursos) do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Estudar para a prova — direto ao ponto, com didatismo e sem juridiquês.

**REGRAS**
- Linguagem simples e precisa. Não cite nº de processos/REsp/AREsp.
- Traga apenas entendimentos **majoritários** de STF/STJ (sem nº).
- Não inclua links; gere **10 buscas Google** em “🔎 Buscas prontas”.

**ENTREGA (nesta ordem):**
1) Conceito direto (5–7 linhas).
2) Mapa mental textual (tópicos hierárquicos).
3) Exemplos práticos de prova (2–3).
4) Entendimento majoritário STF/STJ (bullets; sem nº).
5) Pegadinhas & confusões comuns (4–6).
6) Quadro comparativo (se fizer sentido).
7) Checklist de revisão (10 bullets).
8) 🔎 Buscas prontas — gere 10 links com ${tema}.

**💚 [direito.love](https://direito.love)**`,

    questoes:(tema)=>`Você é **professor e curador de questões** do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** 15 questões (A–E) em 2 etapas (ETAPA 1 sem gabarito; ETAPA 2 com gabarito comentado se autorizado).

**💚 [direito.love](https://direito.love)**`,

    correlatos:(tema)=>`Pesquisador do **direito.love**.

**TEMA-ÂNCORA:** ${tema}
**OBJETIVO:** 20 temas correlatos (3–4 grupos), cada item: título ≤8 palavras + foco + motivo.

**💚 [direito.love](https://direito.love)**`,

    apresentacao:(tema)=>`Professor-orador do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Roteiro oral (5 min) com tempo por seção + miniscript + 3 frases de impacto + 1 pergunta retórica.

**💚 [direito.love](https://direito.love)**`,

    decoreba:(tema)=>`Professor de memorização do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Decoreba assertiva: assertivas essenciais, mnemônicos, confusões, flashcards, regra de bolso.

**💚 [direito.love](https://direito.love)**`,

    casos:(tema)=>`Professor de prática do **direito.love**.

**TEMA-GUIA:** ${tema}
**OBJETIVO:** 3 casos completos com solução, estratégia prática e checklist. + 🔎 10 buscas.

**💚 [direito.love](https://direito.love)**`,

    testeRelampago:(tema)=>`Teste Relâmpago (5 questões) sobre ${tema} com gabarito imediato e resumo final.

**💚 [direito.love](https://direito.love)**`,

    mapaMental:(tema)=>`Mapa mental de ${tema} (Markdown hierárquico, causa→consequência, exceções, palavras‑chave, 3 macetes).

**💚 [direito.love](https://direito.love)**`,

    errosProva:(tema)=>`Erros que mais caem em ${tema} (10–15 bullets: o que cai + como não errar), agrupado por Conceito/Exceções/Jurisprudência/Aplicação.

**💚 [direito.love](https://direito.love)**`,

    quadroComparativo:(tema)=>`Quadro comparativo de ${tema} (Markdown 3 colunas) + “Quando usar qual?” (3 bullets).

**💚 [direito.love](https://direito.love)**`,
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

  function aiButtons(){
    const wrap = el('div','ai-buttons');
    const mk = (name, title)=>{
      const b = el('button','ai'); b.title=title; b.setAttribute('aria-label', title); b.textContent = title[0];
      b.dataset.ai=name; return b;
    };
    wrap.appendChild(mk('chatgpt','ChatGPT'));
    wrap.appendChild(mk('gemini','Gemini'));
    wrap.appendChild(mk('perplexity','Perplexity'));
    return wrap;
  }
  function openAI(ai){
    const map={chatgpt:'https://chat.openai.com/',gemini:'https://gemini.google.com/',perplexity:'https://www.perplexity.ai/'};
    const url=map[ai]; if(url) window.open(url,'_blank','noopener');
  }

  // ---- App logic ----
  let tema=''; const chosen = new Set();

  function showInputBubble(placeholder='Digite o tema…'){
    const wrap = el('div', 'input-bubble');
    const input = el('input'); input.placeholder=placeholder; input.autocomplete='off';
    const row = el('div','row');
    const send = el('button','iconbtn'); send.title='Enviar'; send.innerHTML='<img src="icons/send.svg" alt=""/>';
    row.appendChild(send); wrap.appendChild(input); wrap.appendChild(row);
    const bubble = push('bot', wrap);

    const submit = async ()=>{
      const text = input.value.trim(); if(!text) return input.focus();
      tema = text; bubble.closest('.msg').remove();
      push('user', `<div>${truncate(tema,140)}</div>`);
      let t=typingStart(); await wait(); typingStop(t);
      push('bot', 'Beleza. Vou te mostrar as estratégias disponíveis.');
      await wait(300,700); t=typingStart(); await wait(300,700); typingStop(t);
      push('bot', `O que você quer fazer com <strong>${truncate(tema,60)}</strong>?`);
      await wait(200,500); showChips();
    };
    send.addEventListener('click', submit);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') submit(); });
    input.focus();
  }

  function showChips(){
    const bar = el('div','chips');
    allStrategies.forEach(s=>{
      if(chosen.has(s)) return;
      const b = el('button','chip', labels[s]);
      b.addEventListener('click', ()=> handleStrategy(s));
      bar.appendChild(b);
    });
    push('bot', bar);
  }

  function renderPromptCard(strategy){
    const card = el('div','prompt-card');
    const h = el('h3','prompt-title', truncate(tema,80));
    const ta = el('textarea', null, null); ta.value = Prompts[strategy](tema);
    const row = el('div','row');
    const copy = el('button','iconbtn'); copy.title='Copiar'; copy.innerHTML='<img src="icons/copy.svg" alt=""/>';
    const novo = el('button','iconbtn'); novo.title='Nova pesquisa'; novo.innerHTML='<img src="icons/refresh.svg" alt=""/>';
    row.appendChild(copy); row.appendChild(novo);
    card.appendChild(h); card.appendChild(ta); card.appendChild(row);

    copy.addEventListener('click', async ()=>{
      await navigator.clipboard.writeText(ta.value);
      archiveAdd({ id:Date.now().toString(36), theme:tema, strategy:strategy, strategyLabel:labels[strategy], prompt:ta.value, createdAt:new Date().toISOString() });
      push('bot','copiado');
      const aib = aiButtons();
      aib.querySelectorAll('.ai').forEach(bt=> bt.addEventListener('click', ()=>{ openAI(bt.dataset.ai); showRemaining(); }));
      card.appendChild(aib);
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
    if(!remaining.length){
      push('bot','Fechamos todas as estratégias. Quer iniciar uma nova pesquisa (↻ no topo)?');
      return;
    }
    push('bot', `Quer gerar outro prompt para <strong>${truncate(tema,60)}</strong>? Escolha:`);
    showChips();
  }

  // Top actions
  function bindTop(){
    $('#btn-archive').addEventListener('click', ()=> window.location.href='arquivo.html');
    $('#btn-new').addEventListener('click', ()=>{ tema=''; chosen.clear(); showInputBubble('Digite o tema…'); });
  }

  // PWA
  function registerSW(){
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('sw.js?v=2').catch(()=>{});
    }
  }

  // Boot
  (async function init(){
    bindTop(); registerSW();
    let t=typingStart(); await wait(200,400); typingStop(t);
    push('bot','<strong>Bem-vindo</strong>');
    t=typingStart(); await wait(); typingStop(t);
    push('bot','Qual é o tema?');
    showInputBubble();
  })();
})();