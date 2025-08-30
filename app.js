/**
 * Chat Booy — fluxo completo mantendo layout próprio do projeto.
 * Este bundle é auto-suficiente: index.html + styles.css + app.js + icons.
 */
(function(){
  // ====== Prompts por estratégia ======
  const Prompts = {
    prova:(tema)=>`Você é um **professor de Direito** (OAB/concursos) escolhido pelo projeto **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Estudar para a prova — direto ao ponto, com didatismo e profundidade sem juridiquês.

**REGRAS GERAIS**
- Linguagem simples, objetiva e precisa. Sem números de processos, REsp/AREsp ou acórdãos.
- Traga apenas **entendimentos majoritários** de STF/STJ quando houver.
- Não inclua links diretos. Gere **10 buscas Google** na seção **🔎 Buscas prontas** no formato \`https://www.google.com/search?q=tema+palavra\` (apenas a frase linkada).

**ENTREGA (nesta ordem):**
1) **Conceito direto (5–7 linhas).**
2) **Mapa mental textual** (tópicos hierárquicos).
3) **Exemplos práticos de prova** (2–3 cenários).
4) **Entendimento majoritário STF/STJ** (bullets; sem números).
5) **Pegadinhas & confusões comuns** (4–6 itens).
6) **Quadro comparativo** (se fizer sentido).
7) **Checklist de revisão** (10 bullets).
8) **🔎 Buscas prontas** — gere **10 links** com *${tema}* + palavras‑chave (jurisprudência, acórdãos, súmulas, enunciados, doutrina, decisões, casos, debates, críticas, notícias). **Apenas a frase linkada**.

**FECHAMENTO OBRIGATÓRIO:**
- Pergunte: *“Quer tentar outra estratégia (Questões, Correlatos, Apresentação, Decoreba ou Casos)?”*
- **Gere um novo prompt em [direito.love](https://direito.love)**.`,

    questoes:(tema)=>`Você é **professor e curador de questões** do projeto **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Treinar com **15 questões de múltipla escolha (A–E)**.

**REGRA DE OURO (2 ETAPAS):**
- **ETAPA 1 (agora):** mostre **somente as 15 questões**, sem gabarito.
- Ao final, pergunte: **“Posso liberar o gabarito comentado?”** e **espere autorização**.
- **ETAPA 2 (só se autorizado):** traga **gabarito comentado** item a item.
- Sempre que possível, **derive as questões do conteúdo gerado** em **Estudar p/ Prova** e **Temas Correlatos** já produzidos para este tema.

**CRITÉRIOS DAS QUESTÕES:**
- Priorize **itens reais** (OAB/concursos). Cite **banca e ano** (ex.: “OAB/FGV 2023”). Sem números de processos.
- Itens autorais → marcar “(autorais)”.
- Níveis: **5 fáceis, 6 médias, 4 difíceis** (etiquete).
- Distribua por subtemas relevantes.

**FORMATO ETAPA 1:** [Nível] Enunciado + A–E  
**FORMATO ETAPA 2:** Letra correta + comentário (2–4 linhas), fundamento legal (lei/artigo) + entendimento majoritário STF/STJ (sem nº) + dica de memória.

**PÓS-PROVA:**
- Placar + análise por tópico + próximos passos.
- Ofereça outra estratégia.
- **Gere um novo prompt em [direito.love](https://direito.love)**.`,

    correlatos:(tema)=>`Você é pesquisador jurídico do **direito.love**.

**TEMA-ÂNCORA:** ${tema}
**OBJETIVO:** Sugerir **20 temas correlatos** úteis.

**REGRAS:**
- Organize em **3–4 grupos** (fundamentos, aplicações, controvérsias, prática).
- Cada item: **título (≤ 8 palavras) + foco (OAB/concursos/prática) + motivo (1 linha)**.
- Ordene do básico ao avançado, sem redundância.

**ENTREGA:**
- Liste **1 a 20** e peça: **“Escolha um número para rodar agora.”**
- **Gere um novo prompt em [direito.love](https://direito.love)**.`,

    apresentacao:(tema)=>`Você é professor-orador do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** Roteiro de **apresentação oral (5 min)**, impacto alto.

**ESTRUTURA (com tempo):**
- **0:00–0:30 Abertura** (contexto + tese em 1 frase).
- **0:30–3:30 Desenvolvimento** (3 argumentos com evidência prática).
- **3:30–4:30 Exemplo aplicado** (caso típico).
- **4:30–5:00 Fechamento** (3 bullets + CTA).

**ENTREGA:**
- Roteiro em bullets com marcação de tempo + **miniscript** (falas curtas).
- 3 frases de impacto + 1 pergunta retórica.
- Pergunte se quer **slides/handout** (se sim, descreva 6–8 slides).
- **Gere um novo prompt em [direito.love](https://direito.love)**.`,

    decoreba:(tema)=>`Você é professor de memorização do **direito.love**.

**TEMA:** ${tema}
**OBJETIVO:** **Decoreba assertiva** — curto e certeiro.

**ENTREGA:**
1) **Não posso esquecer:** 12–18 assertivas diretas.
2) **Mnemônicos & macetes:** 3–5.
3) **Confusões comuns:** 3–5 pares.
4) **Flashcards (Q→A):** 6–8.
5) **Regra de bolso (5 bullets).**

**REGRAS:**
- Linguagem simples, sem nº de processos.
- Entendimento majoritário STF/STJ só em ideia, sem citar nº.
- Finalize oferecendo **Questões** ou **Apresentação**.
- **Gere um novo prompt em [direito.love](https://direito.love)**.`,

    casos:(tema)=>`Você é professor de prática do **direito.love**.

**TEMA-GUIA:** ${tema}
**OBJETIVO:** **3 casos concretos completos**, comentados e fundamentados.

**PARA CADA CASO:**
- **Fatos resumidos**, **Problema jurídico**.
- **Solução passo a passo** com **lei/artigo** e **entendimento majoritário STF/STJ** (sem nº).
- **Estratégia prática** (peças cabíveis, riscos).
- **Variações e pegadinhas**.
- **Checklist final**.

**EXTRA — 🔎 Buscas prontas:** gere **10 links** \`https://www.google.com/search?q=tema+palavra\` com *${tema}* + palavras (jurisprudência, acórdãos, súmulas, enunciados, doutrina, decisões, casos, debates, críticas, notícias). **Apenas a frase linkada**.

**FECHAMENTO:**
- Ofereça outra estratégia.
- **Gere um novo prompt em [direito.love](https://direito.love)**.`
  };

  // ====== Utilitários de UI ======
  function $(sel){ return document.querySelector(sel); }
  function push(role, html){
    const box = $('#messages');
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
  }
  function buttons(html){
    const box = $('#messages');
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
    return bubble;
  }
  const sleep = (ms=600)=>new Promise(r=>setTimeout(r,ms));
  function greeting(){
    const h = new Date().getHours();
    if(h>=1 && h<5) return 'Noooite, acordado ainda?';
    if(h<12) return 'Bom dia!';
    if(h<19) return 'Boa tarde!';
    return 'Boa noite!';
  }

  // ====== Fluxo ======
  let tema = '';

  async function boot(){
    push('bot', `<strong>${greeting()}</strong>`);
    await sleep();
    push('bot', 'Vamos lá, vou criar um prompt top pra você.');
    await sleep();
    push('bot', 'Qual o tema? <span class="small">Ex.: Danos estéticos relacionados a acidentes de trabalho</span>');
    $('#input').focus();
  }

  async function showStrategies(){
    await sleep(400);
    push('bot', `Beleza. Escolha o que fazer com <strong>${tema}</strong>:`);
    const holder = buttons(`
      <div class="chips" role="group" aria-label="Estratégias">
        <button class="chip" data-s="prova">Estudar p/ Prova</button>
        <button class="chip" data-s="questoes">Questões (MCQ)</button>
        <button class="chip" data-s="correlatos">Temas correlatos</button>
        <button class="chip" data-s="apresentacao">Apresentação (5 min)</button>
        <button class="chip" data-s="decoreba">Decoreba</button>
        <button class="chip" data-s="casos">Casos concretos</button>
      </div>
    `);
    holder.querySelectorAll('[data-s]').forEach(btn=> btn.addEventListener('click', ()=> handleStrategy(btn.dataset.s)));
  }

  function renderPrompt(strategy){
    const txt = Prompts[strategy](tema);
    return `
      <div class="prompt-card">
        <textarea readonly>${txt}</textarea>
        <div class="row">
          <button class="btn copy">Copiar prompt</button>
          <button class="btn new">Nova pesquisa</button>
        </div>
      </div>`;
  }

  async function handleStrategy(s){
    const labels = {
      prova:'Estudar para Prova',
      questoes:'Questões (múltipla escolha)',
      correlatos:'Temas correlatos',
      apresentacao:'Apresentação oral (5 min)',
      decoreba:'Decoreba',
      casos:'Casos concretos'
    };
    push('user', labels[s] || s);
    await sleep(500);
    push('bot', `Show. Gerando o prompt de <strong>${labels[s]}</strong>…`);
    await sleep(500);
    const cardWrap = buttons(renderPrompt(s));
    const ta = cardWrap.querySelector('textarea');
    cardWrap.querySelector('.copy').addEventListener('click', async ()=>{
      await navigator.clipboard.writeText(ta.value);
      const btn = cardWrap.querySelector('.copy');
      btn.textContent = '✅ Copiado!';
      setTimeout(()=> btn.textContent = 'Copiar prompt', 1200);
    });
    cardWrap.querySelector('.new').addEventListener('click', ()=>{
      tema = '';
      push('bot', 'Vamos lá, qual o novo tema?');
      $('#input').focus();
    });
  }

  async function onSend(){
    const inp = $('#input');
    const text = inp.value.trim();
    if(!text) return;
    push('user', text);
    inp.value='';
    if(!tema){
      tema = text;
      await sleep(600);
      push('bot','Legal, me dá um segundo… já te mostro as opções.');
      await showStrategies();
    } else {
      await sleep(300);
      push('bot','Escolha uma estratégia nos botões acima 😉');
    }
  }

  function bind(){
    $('#send').addEventListener('click', onSend);
    $('#input').addEventListener('keydown', e=>{ if(e.key==='Enter') onSend(); });
  }

  // start
  bind();
  boot();
})();
