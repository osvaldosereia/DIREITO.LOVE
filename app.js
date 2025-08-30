(function(){
  const LS_KEY='chatBooyArchive';
  const lsLoad=()=>{ try{ return JSON.parse(localStorage.getItem(LS_KEY))||[] }catch(e){ return [] } };
  const lsSave=(v)=>localStorage.setItem(LS_KEY, JSON.stringify(v));
  const archiveAdd=(rec)=>{ const L=lsLoad(); L.unshift(rec); lsSave(L); };

  const Prompts = {
    prova:(tema)=>`Você é um **professor de Direito** (OAB/concursos) do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Estudar para a prova — direto ao ponto, com didatismo e sem juridiquês.

**REGRAS**
- Linguagem simples e precisa. Não cite nº de processos/REsp/AREsp.
- Traga apenas entendimentos **majoritários** de STF/STJ (sem nº).
- Não inclua links; gere **10 buscas Google** em “🔎 Buscas prontas” no formato \`https://www.google.com/search?q=tema+palavra\` (somente a frase linkada).

**ENTREGA (nesta ordem):**
1) Conceito direto (5–7 linhas).
2) Mapa mental textual (tópicos hierárquicos).
3) Exemplos práticos de prova (2–3).
4) Entendimento majoritário STF/STJ (bullets; sem nº).
5) Pegadinhas & confusões comuns (4–6).
6) Quadro comparativo (se fizer sentido).
7) Checklist de revisão (10 bullets).
8) 🔎 Buscas prontas — gere **10** links com ${tema} + (jurisprudência, acórdãos, súmulas, enunciados, doutrina, decisões, casos, debates, críticas, notícias).

**FECHAMENTO:** pergunte se quer outra estratégia (Questões, Correlatos, Apresentação, Decoreba ou Casos).

**💚 [direito.love](https://direito.love)**`,

    questoes:(tema)=>`Você é **professor e curador de questões** do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Treinar com **15 questões (A–E)**.

**REGRA DE OURO (2 ETAPAS):**
- ETAPA 1 (agora): mostre apenas as **15 questões**, sem gabarito.
- Ao final, pergunte: “Posso liberar o gabarito comentado?” e **espere autorização**.
- ETAPA 2 (só se autorizado): traga **gabarito comentado** item a item.

**CRITÉRIOS:**
- Preferir itens reais (OAB/concursos). Cite **banca e ano** (ex.: OAB/FGV 2023). Sem nº de processos.
- Autorais → marcar “(autorais)”.
- Níveis: **5 fáceis, 6 médias, 4 difíceis** (etiquetar).
- Distribuir por subtemas relevantes.

**FORMATOS:**
- ETAPA 1: [Nível] Enunciado + alternativas A–E.
- ETAPA 2: Letra correta + comentário (2–4 linhas), fundamento legal (lei/artigo), entendimento majoritário STF/STJ (sem nº), dica de memória.

**PÓS-PROVA:** Placar + análise por tópico + próximos passos; oferecer outra estratégia.

**💚 [direito.love](https://direito.love)**`,

    correlatos:(tema)=>`Você é pesquisador jurídico do **direito.love**.

**TEMA-ÂNCORA:** ${tema}
**OBJETIVO:** Sugerir **20 temas correlatos** úteis.

**REGRAS:**
- Organize em **3–4 grupos** (fundamentos, aplicações, controvérsias, prática).
- Cada item: **título (≤8 palavras) + foco (OAB/concursos/prática) + motivo (1 linha)**.
- Ordenar do básico ao avançado, sem redundância.

**ENTREGA:**
- Liste 1 a 20 e peça: “Escolha um número para rodar agora.”

**💚 [direito.love](https://direito.love)**`,

    apresentacao:(tema)=>`Você é professor-orador do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Roteiro de **apresentação oral (5 min)**, de alto impacto.

**ESTRUTURA (com tempo):**
- 0:00–0:30 Abertura (contexto + tese em 1 frase).
- 0:30–3:30 Desenvolvimento (3 argumentos com evidência prática).
- 3:30–4:30 Exemplo aplicado (caso típico).
- 4:30–5:00 Fechamento (3 bullets + CTA).

**ENTREGA:**
- Roteiro em bullets com marcação de tempo + **miniscript** (falas curtas).
- 3 frases de impacto + 1 pergunta retórica.
- Pergunte se quer **slides/handout** (se sim, descreva 6–8 slides).

**💚 [direito.love](https://direito.love)**`,

    decoreba:(tema)=>`Você é professor de memorização do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** **Decoreba assertiva** — curto e certeiro.

**ENTREGA:**
1) Não posso esquecer: 12–18 assertivas diretas.
2) Mnemônicos & macetes: 3–5.
3) Confusões comuns: 3–5 pares (diferencie).
4) Flashcards (Pergunta→Resposta): 6–8.
5) Regra de bolso (5 bullets).

**REGRAS:**
- Linguagem simples, sem nº de processos.
- STF/STJ só em ideia majoritária, sem nº.
- Finalize oferecendo Questões ou Apresentação.

**💚 [direito.love](https://direito.love)**`,

    casos:(tema)=>`Você é professor de prática do **direito.love**.

**TEMA-GUIA:** ${tema}
**OBJETIVO:** **3 casos concretos completos**, comentados e fundamentados.

**PARA CADA CASO:**
- Fatos resumidos, Problema jurídico.
- Solução passo a passo com lei/artigo e entendimento majoritário STF/STJ (sem nº).
- Estratégia prática (peças cabíveis, riscos).
- Variações e pegadinhas.
- Checklist final.

**EXTRA — 🔎 Buscas prontas:** gere **10 links** \`https://www.google.com/search?q=tema+palavra\` com ${tema} + (jurisprudência, acórdãos, súmulas, enunciados, doutrina, decisões, casos, debates, críticas, notícias). **Apenas a frase linkada**.

**💚 [direito.love](https://direito.love)**`,

    testeRelampago:(tema)=>`Você é elaborador do **direito.love** e criará um **Teste Relâmpago (5 questões)** para fixação rápida.

**TEMA:** ${tema}
**OBJETIVO:** Micro-avaliação para revisar em poucos minutos (mobile-friendly).

**FORMATO:**
- 5 questões objetivas (A–E), **com gabarito imediato após cada questão**.
- Linguagem simples; foque em pegadinhas usuais.
- Cada gabarito: 1–2 linhas com porquê a correta é correta e as demais, não.

**ENTREGA:**
1) Q1 (A–E) → Gabarito imediato.
2) Q2 (A–E) → Gabarito imediato.
3) Q3 (A–E) → Gabarito imediato.
4) Q4 (A–E) → Gabarito imediato.
5) Q5 (A–E) → Gabarito imediato.
6) Resumo de desempenho com recomendações de revisão.

**💚 [direito.love](https://direito.love)**`,

    mapaMental:(tema)=>`Você é professor-esquematizador do **direito.love** e criará um **Mapa Mental Explicativo**.

**TEMA:** ${tema}
**OBJETIVO:** Visão visual e conectada dos principais conceitos.

**FORMATO:**
- Tópicos em **Markdown** com níveis (•, ◦, –).
- Indique **causa → consequência**, **exceções**, **palavras‑chave**.
- Finalize com bloco **“Como lembrar”** (3 macetes).
- Se fizer sentido, um mini-diagrama textual usando → e ⇄.

**ENTREGA:**
- Núcleo do tema → subtemas → exceções → jurisprudência majoritária (sem nº) → prática.
- “Como lembrar” (3 bullets).

**💚 [direito.love](https://direito.love)**`,

    errosProva:(tema)=>`Você é coach de prova do **direito.love** e listará os **Erros que mais caem**.

**TEMA:** ${tema}
**OBJETIVO:** Destacar pegadinhas, confusões e pontos de reprovação.

**FORMATO:**
- Tópicos curtos e **cirúrgicos** (1–2 linhas).
- Para cada erro: **o que cai** + **como não errar** (dica prática).
- Agrupar em: Conceito, Exceções, Jurisprudência, Aplicação prática.

**ENTREGA:**
- 10–15 bullets, agrupados nas 4 categorias.
- Checklist final (5 itens).

**💚 [direito.love](https://direito.love)**`,

    quadroComparativo:(tema)=>`Você é professor comparatista do **direito.love** e fará um **Quadro comparativo**.

**TEMA:** ${tema}
**OBJETIVO:** Evitar confusão entre institutos semelhantes.

**FORMATO (Markdown):**
| Instituto | Definição objetiva | Exemplo‑chave |
|---|---|---|
| ... | ... | ... |

**INSTRUÇÕES:**
- Liste 4–8 linhas relevantes ao tema.
- Definições curtas e funcionais (sem juridiquês).
- Exemplo prático por linha.
- Feche com “Quando usar qual?” em 3 bullets.

**💚 [direito.love](https://direito.love)**`
  };

  const $ = s=>document.querySelector(s);
  const sleep = ms=> new Promise(r=> setTimeout(r, ms));
  const wait = (min=1000,max=1800)=> {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    return sleep(reduce?0: Math.floor(Math.random()*(max-min+1))+min);
  };
  function push(role, html){
    const box = $('#messages');
    const w = document.createElement('div');
    w.className = `msg ${role}`;
    const b = document.createElement('div');
    b.className='bubble';
    b.innerHTML = html;
    w.appendChild(b); box.appendChild(w);
    box.scrollTop = box.scrollHeight;
    return w;
  }
  function typingStart(){ return push('bot', `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`); }
  function typingStop(node){ if(node && node.parentElement){ node.parentElement.removeChild(node); } }
  function truncate(t,n=80){ return t.length>n? t.slice(0,n-1)+'…': t; }
  const labels = ()=>({prova:'Estudar p/ Prova', questoes:'Questões (A–E)', correlatos:'Correlatos', apresentacao:'Apresentação (5min)', decoreba:'Decoreba', casos:'Casos concretos', testeRelampago:'🧪 Teste', mapaMental:'🧠 Mapa', errosProva:'🎯 Erros', quadroComparativo:'📚 Quadro'});
  const allStrategies = ()=> Object.keys(labels());

  let tema=''; let chosen=new Set(); let lastSavedId=null;

  async function showRemaining(prefix=true){
    const L=labels(); const remaining = allStrategies().filter(s=> !chosen.has(s));
    if(!remaining.length){ const t=typingStart(); await wait(); typingStop(t); push('bot','Fechamos todas as estratégias. Quer iniciar uma nova pesquisa (↻ no topo)?'); return; }
    if(prefix){ const t=typingStart(); await wait(); typingStop(t); push('bot', `Escolha outra estratégia para <strong>${truncate(tema,60)}</strong>:`); }
    const bar=document.createElement('div'); bar.className='chips';
    remaining.forEach(s=>{ const b=document.createElement('button'); b.className='chip'; b.textContent=L[s]; b.setAttribute('data-s', s); b.addEventListener('click',()=>handleStrategy(s)); bar.appendChild(b); });
    push('bot', bar.outerHTML);
  }

  function renderPrompt(s){
    const txt = Prompts[s](tema);
    return `<div class="prompt-card">
      <h3 class="prompt-title">${truncate(tema,80)}</h3>
      <textarea readonly>${txt}</textarea>
      <div class="row">
        <button class="iconbtn copy" title="Copiar"><img src="icons/copy.svg" alt=""></button>
        <button class="iconbtn new" title="Nova pesquisa"><img src="icons/refresh.svg" alt=""></button>
      </div>
    </div>`;
  }
  function renderAI(){ return `<div class="ai-buttons" role="group" aria-label="Abrir na IA">
    <button class="ai" data-ai="chatgpt" title="Abrir no ChatGPT"><img src="icons/chatgpt.svg" alt=""></button>
    <button class="ai" data-ai="gemini" title="Abrir no Gemini"><img src="icons/gemini.svg" alt=""></button>
    <button class="ai" data-ai="perplexity" title="Abrir no Perplexity"><img src="icons/perplexity.svg" alt=""></button>
  </div>`; }
  function openAI(ai){ const map={chatgpt:'https://chat.openai.com/', gemini:'https://gemini.google.com/', perplexity:'https://www.perplexity.ai/'}; const url=map[ai]; if(url) window.open(url,'_blank','noopener'); }

  async function handleStrategy(s){
    const L=labels(); chosen.add(s);
    push('user', `<div class="bubble">${L[s]}</div>`);
    let t=typingStart(); await wait(); typingStop(t);
    push('bot', `Gerando prompt de <strong>${L[s]}</strong>…`);
    t=typingStart(); await wait(1200,2000); typingStop(t);
    const wrap = push('bot', renderPrompt(s));
    const card = wrap.querySelector('.prompt-card'); const ta=card.querySelector('textarea');
    const btnCopy=card.querySelector('.copy'); const btnNew=card.querySelector('.new');

    btnCopy.addEventListener('click', async ()=>{
      await navigator.clipboard.writeText(ta.value);
      btnCopy.title='Copiado!'; btnCopy.setAttribute('aria-label','Copiado');
      lastSavedId = (Date.now().toString(36)+Math.random().toString(36).slice(2,8));
      archiveAdd({ id:lastSavedId, theme:tema, strategy:s, strategyLabel=L[s], prompt:ta.value, createdAt:new Date().toISOString(), aiClicks:[] });
      await sleep(350);
      const aiWrap=document.createElement('div'); aiWrap.innerHTML=renderAI(); card.appendChild(aiWrap.firstElementChild);
      card.querySelectorAll('.ai').forEach(btn=> btn.addEventListener('click', async ()=>{
        const ai = btn.getAttribute('data-ai'); let t=typingStart(); await sleep(400); typingStop(t); push('bot','copiado'); openAI(ai); await sleep(400); showRemaining(true);
      }));
      setTimeout(()=>{ btnCopy.title='Copiar'; btnCopy.setAttribute('aria-label','Copiar'); }, 1200);
    });
    btnNew.addEventListener('click', ()=>{ tema=''; chosen=new Set(); push('bot','Novo tema?'); $('#input').focus(); });
  }

  async function onSend(){
    const inp=$('#input'); const text=inp.value.trim(); if(!text) return;
    push('user', `<div class="bubble">${truncate(text,140)}</div>`); inp.value='';
    if(!tema){ tema=text; let t=typingStart(); await wait(); typingStop(t);
      push('bot','Beleza. Vou te mostrar as estratégias disponíveis.');
      await wait(500,900); t=typingStart(); await wait(300,700); typingStop(t);
      push('bot', `O que você quer fazer com <strong>${truncate(tema,60)}</strong>?`);
      await wait(300,600); showRemaining(false);
    } else { let t=typingStart(); await wait(400,700); typingStop(t); push('bot','Escolha uma estratégia nos botões acima.'); }
  }

  function bind(){
    $('#send').addEventListener('click', onSend);
    $('#input').addEventListener('keydown', e=>{ if(e.key==='Enter') onSend(); });
    $('#btn-archive').addEventListener('click', ()=>{ window.location.href='arquivo.html'; });
    $('#btn-new').addEventListener('click', ()=>{ tema=''; chosen=new Set(); push('bot','Novo tema?'); $('#input').focus(); });
  }
  function maybeReopen(){
    try{ const data=JSON.parse(localStorage.getItem('chatBooyReopen')||'null'); if(!data) return;
      localStorage.removeItem('chatBooyReopen'); tema=data.theme;
      const t=typingStart(); setTimeout(()=>{ typingStop(t); push('bot','Reabrindo do arquivo…'); handleStrategy(data.strategy); }, 700);
    }catch(e){}
  }
  (async function init(){
    bind(); let t=typingStart(); await sleep(300); typingStop(t);
    push('bot','<strong>Bem-vindo</strong>'); t=typingStart(); await wait(); typingStop(t);
    push('bot','Qual é o tema?'); $('#input').focus(); maybeReopen();
  })();
})();
