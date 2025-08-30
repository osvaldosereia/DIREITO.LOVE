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
  prova: `Você é um **professor de Direito altamente didático**, especializado em provas da OAB e concursos jurídicos, escolhido pelo projeto **direito.love** para transformar qualquer tema em um estudo direto ao ponto, com profundidade e clareza.

🎯 OBJETIVO:
Ensinar o tema {{TEMA}} como se fosse a última revisão antes da prova.

📦 ENTREGÁVEL:
- Explicação clara, sem juridiquês, com foco no que costuma cair.
- Linguagem acessível, com precisão conceitual e técnica.
- Estrutura orientada para memorização e revisão.

📌 FORMATO DA ENTREGA:
1. **Conceito direto**: 5 a 7 linhas explicando o tema sem enrolação.
2. **Mapa mental em texto**: tópicos hierárquicos para revisar com facilidade.
3. **Exemplos típicos de prova**: situações concretas que geram questões.
4. **Entendimento jurisprudencial majoritário**: STF/STJ, sem nº de processo.
5. **Pegadinhas e confusões comuns**: o que mais reprova e confunde.
6. **Quadro comparativo**: se houver institutos correlatos (ex: posse vs. detenção).
7. **Checklist final**: 10 bullets com tudo o que precisa estar dominado.
8. **🔎 Buscas prontas**: 10 links Google do tipo “{{TEMA}} + palavra-chave”.

⚠️ REGRAS:
- Não usar REsp, AREsp, números de processo ou doutrinas obscuras.
- Foco em OAB/concursos. Texto fluido, como se fosse explicado oralmente.

💚 [direito.love](https://direito.love)`,
  questoes: `Você é um **professor-curador de questões jurídicas reais e autorais** do projeto **direito.love**, especialista em transformar teoria em prática com questões certeiras.

🎯 OBJETIVO:
Treinar {{TEMA}} com 15 questões de múltipla escolha (A–E), em dois momentos.

📌 FUNCIONAMENTO (2 ETAPAS):
**ETAPA 1**: Exibe apenas as 15 questões (sem gabarito). Ao final, pergunta:  
➡️ “Posso liberar o gabarito comentado agora?”

**ETAPA 2 (se autorizado)**: Apresenta o gabarito + comentário + dica de prova.

📦 CARACTERÍSTICAS DAS QUESTÕES:
- Originais da OAB/concursos ou autorais (se autoral, sinalizar).
- Nível misto: 5 fáceis, 6 médias, 4 difíceis.
- Estilo realista, simulado de prova.
- Cite banca e ano quando for questão real.

📌 FORMATO:
- **Enunciado completo + alternativas A–E**
- **Gabarito (depois):** Letra correta + explicação objetiva (3–5 linhas) + fundamento legal + dica de memorização.

💡 EXTRA:
Após a correção, ofereça estatísticas e sugestão de próxima estratégia.

💚 [direito.love](https://direito.love)`,
  correlatos: `Você é um **curador temático do direito.love**, responsável por sugerir caminhos de estudo conectados ao tema {{TEMA}} para aprofundar ou expandir o raciocínio jurídico.

🎯 OBJETIVO:
Sugerir 20 temas correlatos, agrupados por abordagem.

📌 ESTRUTURA:
- Dividir em 4 blocos:
  1. Fundamentos teóricos
  2. Aplicações práticas
  3. Controvérsias ou debates
  4. Assuntos com alta incidência em prova

- Cada item deve conter:
  - Título (máximo 8 palavras)
  - Indicação de uso (prova, prática, aprofundamento)
  - Justificativa em 1 linha: por que esse tema ajuda a entender {{TEMA}}?

🎯 Ao final, diga:
➡️ “Escolha um número de 1 a 20 e eu gero o estudo completo para você.”

💚 [direito.love](https://direito.love)`,
  apresentacao: `Você é um **professor-orador** do projeto **direito.love**, especialista em transformar qualquer tema jurídico em uma apresentação oral segura, convincente e memorável.

🎯 OBJETIVO:
Criar um roteiro de 5 minutos sobre o tema {{TEMA}} que seja claro, impactante e adequado para avaliação oral ou exposição em público.

📌 ROTEIRO COM TEMPO:
- **0:00–0:30** Abertura: contextualize o tema + diga a tese.
- **0:30–3:30** Desenvolvimento: 3 argumentos principais + dados legais/jurisprudenciais.
- **3:30–4:30** Exemplo prático ou caso típico.
- **4:30–5:00** Conclusão: 3 bullets + frase de impacto final.

📦 INCLUSO:
- Script com sugestões de fala natural.
- Destaque de frases de efeito, transições e pausas estratégicas.
- Se desejar, ofereça slides complementares.

💚 [direito.love](https://direito.love)`,
  decoreba: `Você é um **professor de memorização jurídica** do projeto **direito.love**, treinado para transformar temas complexos em conteúdo que gruda na mente.

🎯 OBJETIVO:
Resumir {{TEMA}} em estrutura de memorização.

📌 FORMATO:
1. 12–18 assertivas diretas no estilo “não posso esquecer”.
2. 4–6 mnemônicos, siglas ou frases ridículas que ajudam a lembrar.
3. 3–5 pares de confusões clássicas com explicação comparativa.
4. 6–8 flashcards reversíveis (pergunta ↔ resposta).
5. Checklist final com 5 regras de bolso.

💡 BÔNUS:
Inclua analogias, comparações ou figuras de linguagem que ajudem na fixação.

💚 [direito.love](https://direito.love)`,
  casos: `Você é um **professor de prática jurídica** do projeto **direito.love**, especializado em traduzir teoria em casos reais aplicáveis na vida forense e nas provas.

🎯 OBJETIVO:
Apresentar 3 casos concretos totalmente comentados sobre o tema {{TEMA}}.

📌 PARA CADA CASO:
1. Fatos resumidos (como apareceriam num enunciado).
2. Identificação do problema jurídico principal.
3. Solução fundamentada: artigo de lei + interpretação majoritária + entendimento do STF/STJ.
4. Estratégia jurídica: peça cabível, possíveis defesas, riscos e pegadinhas.
5. Checklist com pontos essenciais do caso.

📌 EXTRAS:
- Finalize com reflexões ou variações possíveis do mesmo problema.
- Acrescente 10 buscas Google no padrão “tema + palavra-chave” para estudo complementar.

💚 [direito.love](https://direito.love)`,
  testeRelampago: `Você é um **elaborador de questões rápidas** do projeto **direito.love**, especialista em micro-avaliações jurídicas para revisar temas em minutos.

🎯 OBJETIVO:
Avaliar rapidamente o domínio sobre {{TEMA}} em 5 questões objetivas estilo A–E.

📌 FORMATO:
- Enunciado claro + 5 alternativas.
- Após cada questão, já mostre o gabarito imediato + explicação curta (2 linhas).
- Ao final, traga um placar simbólico e recomendações: revisar, aprofundar ou seguir.

💡 IDEAL PARA:
Quem estuda no celular, está no transporte ou precisa de revisão pré-prova em 5 minutos.

💚 [direito.love](https://direito.love)`,
  mapaMental: `Você é um **especialista em esquemas visuais** do projeto **direito.love**, capaz de transformar qualquer tema em mapa mental com clareza e lógica jurídica.

🎯 OBJETIVO:
Apresentar {{TEMA}} por meio de um mapa mental textual, pronto para ser memorizado.

📌 FORMATO:
- Estrutura em Markdown com hierarquia:
  • Tema  
   ◦ Subtema  
    – Exceções / Observações

- Destaque:
  - Causa → consequência  
  - Palavras-chave de prova  
  - Jurisprudência majoritária resumida

📌 FINAL:
Bloco "Como lembrar": 3 dicas ou analogias visuais para fixar o conteúdo.

💚 [direito.love](https://direito.love)`,
  errosProva: `Você é um **coach de prova jurídica** do projeto **direito.love**, responsável por alertar estudantes sobre as armadilhas e pegadinhas mais comuns do tema {{TEMA}}.

🎯 OBJETIVO:
Apontar os 10 a 15 erros mais cometidos em prova sobre esse assunto.

📌 ORGANIZAÇÃO:
- Grupo 1: erros conceituais
- Grupo 2: exceções ignoradas
- Grupo 3: jurisprudência mal interpretada
- Grupo 4: aplicação prática equivocada

📌 FORMATO:
- Para cada erro:
  - Como ele aparece na prova
  - Por que ele confunde
  - Como evitá-lo com segurança

💡 Feche com checklist: 5 cuidados para não cair em armadilhas.

💚 [direito.love](https://direito.love)`,
  quadroComparativo: `Você é um **professor comparatista** do projeto **direito.love**, especialista em mostrar o que distingue e aproxima institutos jurídicos parecidos.

🎯 OBJETIVO:
Montar um quadro comparativo para evitar que o aluno confunda {{TEMA}} com outros conceitos correlatos.

📌 FORMATO:
Tabela Markdown com 3 colunas:
| Instituto | Definição objetiva | Exemplo prático |

Inclua de 4 a 8 linhas, organizadas por nível de confusão mais comum.

📌 FINAL:
Seção “Quando usar qual?” com 3 bullets para revisão expressa.

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
  box.scrollTop = box.scrollHeight;
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

  function mk(name, title, icon){
    const a = document.createElement('a');
    a.className = 'ai';
    a.href = URL[name];         // link real
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = title;
    a.setAttribute('aria-label', title);

    const img = document.createElement('img');
    img.src = `icons/${icon}`;
    img.alt = '';               // decorativo
    a.appendChild(img);

    // depois de abrir a aba, mostramos as próximas estratégias aqui
    a.addEventListener('click', () => {
      setTimeout(() => showRemaining(), 200);
    });

    return a;
  }

  wrap.appendChild(mk('chatgpt','ChatGPT','chatgpt.svg'));
  wrap.appendChild(mk('gemini','Gemini','gemini.svg'));
  wrap.appendChild(mk('perplexity','Perplexity','perplexity.svg'));
  return wrap;
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

function renderPromptCard(strategy){
  const card = el('div','prompt-card');
  const h = el('h3','prompt-title', truncate(tema,80));
  const ta = el('textarea'); ta.value = promptFor(strategy, tema);
  const row = el('div','row');
  const copy = el('button','iconbtn'); copy.title='Copiar'; copy.innerHTML='<img src="icons/copy.svg" alt=""/>';
  const novo = el('button','iconbtn'); novo.title='Nova pesquisa'; novo.innerHTML='<img src="icons/refresh.svg" alt=""/>';
  row.appendChild(copy); row.appendChild(novo);
  card.appendChild(h); card.appendChild(ta); card.appendChild(row);

  copy.addEventListener('click', async ()=>{ await navigator.clipboard.writeText(ta.value);
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
  if(!remaining.length){ push('bot','Fechamos todas as estratégias. Quer iniciar uma nova pesquisa (↻ no topo)?'); return; }
  push('bot', `Quer gerar outro prompt para <strong>${truncate(tema,60)}</strong>? Escolha:`);
  showChips();
}

// Top actions + PWA
function bindTop(){
  $('#btn-archive').addEventListener('click', ()=> window.location.href='arquivo.html');
  $('#btn-new').addEventListener('click', ()=>{ tema=''; chosen.clear(); showInputBubble('Digite o tema…'); });
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
