<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>direito.love — Gerar Prompts</title>
  <meta name="theme-color" content="#0c4160" />

  <!-- PWA -->
  <link rel="manifest" href="./manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <link rel="apple-touch-icon" href="./icons/icon-192.png" />
  <link rel="apple-touch-icon" sizes="192x192" href="./icons/icon-192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="./icons/icon-512.png">

  <style>
    :root{
      --bg:#f6f7fb; --surface:#ffffff; --ink:#0f172a; --muted:#6b7280; --border:#e5e7eb;
      --primary:#0c4160; --primary-2:#0e567c; --chip:#eef6ff; --success:#0ea5e9;
      --radius:22px; --elev-1:0 8px 30px rgba(15,23,42,.08);
      --fs-h:clamp(22px,4vw,42px); --fs-b:clamp(14px,1.8vw,16px);
    }
    *{ box-sizing:border-box }
    html,body{ height:100% }
    body{
      margin:0;
      background:
        radial-gradient(1200px 800px at 0% -20%, #eaf7f5 0%, transparent 60%),
        radial-gradient(800px 600px at 110% 10%, #f1f6fb 0%, transparent 55%),
        var(--bg);
      color:var(--ink);
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      font-size:var(--fs-b);
    }
    .wrap{ max-width:960px; margin:0 auto; padding:28px 16px 96px }
    .top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px }
    .brand{ display:flex; align-items:center; gap:12px }
    .logo{ display:block; width:auto; height:40px; border-radius:10px }
    @media (min-width:880px){ .logo{ height:48px } }

    /* Tabs */
    .tabs{ display:flex; gap:8px; margin:8px 0 18px }
    .tab{ all:unset; border:1px solid var(--border); background:#fff; padding:8px 14px; border-radius:999px; cursor:pointer; font-weight:700 }
    .tab[aria-selected="true"]{ background:var(--primary); color:#fff; border-color:transparent }

    .card{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--elev-1); padding:22px }
    .title{ font-weight:700; font-size:var(--fs-h); line-height:1.05; margin:0 0 6px }
    .subtitle{ color:var(--muted); margin:0 0 16px }

    .row{ display:grid; gap:12px; grid-template-columns:1fr }
    .field{
      width:100%; border:1px solid var(--border); background:#f4f7fb;
      border-radius:16px; padding:14px 16px; outline:none; color:var(--ink);
    }
    .field:focus{ border-color:#b9c6d1; box-shadow:0 0 0 3px rgba(14,86,124,.12) }

    .btn{ all:unset; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px 16px; border-radius:14px; font-weight:700; cursor:pointer }
    .btn-primary{ background:var(--primary); color:#fff }
    .btn-primary:hover{ background:var(--primary-2) }
    .btn-ghost{ border:1px solid var(--border); background:#fff; color:var(--ink) }

    .thinking{ display:none; align-items:center; gap:10px; margin-top:16px; color:#0a2430 }
    .dot{ width:8px; height:8px; border-radius:999px; background:var(--primary); opacity:.6; animation:bounce .9s infinite }
    .dot:nth-child(2){ animation-delay:.15s }
    .dot:nth-child(3){ animation-delay:.3s }
    @keyframes bounce{ 0%,80%,100%{ transform:translateY(0); opacity:.3 } 40%{ transform:translateY(-6px); opacity:1 } }

    .result{ display:none; margin-top:18px }
    .lead{ font-weight:600; margin:0 0 10px }
    .copygrid{ display:grid; gap:10px; grid-template-columns:1fr }
    .copy-btn{
      all:unset; display:flex; align-items:center; justify-content:space-between;
      padding:14px 16px; border:1px solid var(--border); border-radius:14px; background:#fff; cursor:pointer
    }
    .copy-btn .lbl{ font-weight:700 }
    .copy-btn .hint{ color:var(--muted); font-size:.95em }
    .copy-btn:active{ transform:translateY(1px) }

    .divider{ height:1px; background:var(--border); margin:18px 0 }
    .again{ display:flex; justify-content:center; margin-top:16px }

    /* PWA CTA */
    .install-wrap{ display:flex; justify-content:center; margin:22px 0 8px }
    .install-cta{
      background:var(--primary); color:#fff; border-radius:18px; padding:16px 22px;
      font-size:18px; font-weight:700; box-shadow:0 10px 30px rgba(12,65,96,.18)
    }
    .install-cta:hover{ background:var(--primary-2) }
    .install-cta-wrap{ display:flex; flex-direction:column; align-items:center; gap:6px }
    .install-note{ color:var(--muted); font-size:14px; text-align:center }

    /* IA footer */
    .ai-footer{ padding:18px 0 28px }
    .ai-links{ display:flex; flex-wrap:wrap; gap:12px; justify-content:center }
    .ai-link{
      all:unset; display:inline-flex; align-items:center; justify-content:center;
      background:var(--primary); color:#fff; padding:6px 10px; border-radius:999px;
      font-size:12px; font-weight:600; opacity:.95; cursor:pointer; transition:opacity .2s
    }
    .ai-link:hover{ opacity:1 }
    @media (min-width:880px){ .ai-link{ font-size:12.5px } }

    /* Arquivo */
    .list{ display:grid; gap:10px }
    .item{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; border:1px solid var(--border); background:#fff; border-radius:14px; padding:12px 14px }
    .meta{ display:grid; gap:4px; min-width:0 }
    .obj{ font-weight:700 }
    .tema{ color:var(--ink) }

    .sr-only{
      position:absolute !important; width:1px; height:1px; padding:0; margin:-1px;
      overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
    }

    @media (min-width:880px){
      .row{ grid-template-columns:1fr auto }
      .btn-primary{ padding-left:22px; padding-right:22px }
      .copygrid{ grid-template-columns:1fr 1fr }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <div class="brand">
        <img class="logo" src="./icons/logo-menu.png" onerror="this.onerror=null;this.src='./icons/icon-192.png'" alt="direito.love" />
        <!-- texto removido: só a imagem da logo -->
      </div>
      <a class="btn btn-ghost" href="https://www.instagram.com/osvaldosereiajr/" target="_blank" rel="noopener" aria-label="Abrir Instagram do autor">Instagram</a>
    </header>

    <nav class="tabs" role="tablist" aria-label="Navegação">
      <button class="tab" id="tab-gerar" aria-controls="panel-gerar" aria-selected="true">Gerar</button>
      <button class="tab" id="tab-arquivo" aria-controls="panel-arquivo" aria-selected="false">Arquivo</button>
    </nav>

    <!-- Painel: Gerar -->
    <section id="panel-gerar" class="card" role="tabpanel" aria-labelledby="tab-gerar">
      <h1 class="title">Gerar Prompts</h1>
      <p class="subtitle">Digite apenas o tema que eu faço a mágica</p>

      <div class="row">
        <input id="tema" class="field" type="text" placeholder="Ex.: Critérios do STJ para fixar dano moral por negativação indevida" aria-label="Tema" />
        <button id="gerar" class="btn btn-primary">GERAR PROMPTS</button>
      </div>

      <div id="thinking" class="thinking" aria-live="polite">
        <span class="sr-only">Processando…</span>
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        <span>pensando…</span>
      </div>

      <section id="result" class="result" aria-live="polite">
        <p class="lead">Criei 4 prompts com a estratégia Google (3 sites sorteados) e “Buscas prontas” apenas onde indicado.</p>
        <div class="copygrid">
          <button class="copy-btn" id="copy-aprender"><span class="lbl">APRENDER</span> <span class="hint">copiar</span></button>
          <button class="copy-btn" id="copy-treinar"><span class="lbl">TREINAR</span> <span class="hint">copiar</span></button>
          <button class="copy-btn" id="copy-noticias"><span class="lbl">NOTÍCIAS</span> <span class="hint">copiar</span></button>
          <button class="copy-btn" id="copy-casoreal"><span class="lbl">CASO REAL</span> <span class="hint">copiar</span></button>
        </div>
        <div class="divider"></div>
        <div class="again">
          <button id="reset" class="btn btn-primary">Nova Pesquisa</button>
        </div>
      </section>
    </section>

    <!-- CTA de instalação -->
    <div class="install-wrap">
      <div class="install-cta-wrap">
        <button id="btn-install" class="btn install-cta" style="display:none">Instalar app</button>
        <div id="install-note" class="install-note" style="display:none">Instale para usar offline e abrir mais rápido</div>
      </div>
    </div>

    <!-- Painel: Arquivo -->
    <section id="panel-arquivo" class="card" role="tabpanel" aria-labelledby="tab-arquivo" hidden>
      <h2 class="title" style="font-size:26px">Arquivo — últimas 50 pesquisas</h2>
      <p class="subtitle">Clique em "Copiar" para enviar o prompt ao clipboard.</p>
      <div id="book-list" class="list"></div>
    </section>
  </div>

  <footer class="ai-footer" aria-label="Ferramentas de IA">
    <div class="ai-links">
      <a class="ai-link" href="https://chat.openai.com/" target="_blank" rel="noopener" aria-label="Abrir ChatGPT">GPT</a>
      <a class="ai-link" href="https://gemini.google.com/" target="_blank" rel="noopener" aria-label="Abrir Gemini">Gemini</a>
      <a class="ai-link" href="https://www.perplexity.ai/" target="_blank" rel="noopener" aria-label="Abrir Perplexity">Perplexity</a>
      <a class="ai-link" href="https://www.phind.com/" target="_blank" rel="noopener" aria-label="Abrir Phind">Phind</a>
      <a class="ai-link" href="https://notebooklm.google.com/" target="_blank" rel="noopener" aria-label="Abrir NotebookLM">NotebookLM</a>
      <a class="ai-link" href="https://consensus.app/" target="_blank" rel="noopener" aria-label="Abrir Consensus">Consensus</a>
    </div>
  </footer>

  <script>
    // ===== Navegação de abas =====
    const tabGerar = document.getElementById('tab-gerar');
    const tabArq = document.getElementById('tab-arquivo');
    const panelGerar = document.getElementById('panel-gerar');
    const panelArq = document.getElementById('panel-arquivo');
    function selectTab(which){
      const gerar = which === 'gerar';
      tabGerar.setAttribute('aria-selected', gerar);
      tabArq.setAttribute('aria-selected', !gerar);
      panelGerar.hidden = !gerar;
      panelArq.hidden = gerar;
      if(!gerar) renderBookAll();
    }
    tabGerar.addEventListener('click', () => selectTab('gerar'));
    tabArq.addEventListener('click', () => selectTab('arquivo'));

    // ===== Pool fixo (10 sites) — 3 aleatórios por prompt =====
    const SITES_POOL = [
      'JusBrasil',
      'Jus',
      'JurisWay',
      'Conjur',
      'Âmbito Jurídico',
      'Pergunte Direito',
      'Dicionário Direito',
      'Conteúdo Jurídico',
      'Dicionário Informal',
      'LegJur',
      'Planalto'
    ];
    function pickSites(n = 3) {
      const arr = [...SITES_POOL];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.slice(0, n);
    }
    function makeSearchURL(tema, extras = [], picks = pickSites(3)) {
      const q = [tema, ...picks, ...extras].join(' ').trim();
      return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    }

    // ===== util: gerar 10 "buscas prontas" (sem citar sites) =====
    function makeQuickLinks(tema){
      // 6 obrigatórios + 4 adicionais
      const items = [
        { label: 'notícias recentes', kw: 'notícias recentes' },
        { label: 'casos famosos', kw: 'casos famosos' },
        { label: 'jurisprudência', kw: 'jurisprudência' },
        { label: 'acórdãos', kw: 'acórdão' },
        { label: 'súmulas', kw: 'súmulas' },
        { label: 'enunciados', kw: 'enunciados' },
        // extras inteligentes (genéricos e úteis)
        { label: 'doutrina', kw: 'doutrina' },
        { label: 'princípios aplicáveis', kw: 'princípios' },
        { label: 'tese repetitiva / tema', kw: 'tese repetitiva tema' },
        { label: 'modelos de peças e recursos', kw: 'modelo peça recurso' }
      ];
      return items.map(({label, kw})=>{
        const url = `https://www.google.com/search?q=${encodeURIComponent(`${tema} ${kw}`)}`;
        return `- [${label}](${url})`;
      }).join('\n');
    }

    // ===== CTA padronizada =====
    const CTA = `\n\nGere um novo prompt em [direito.love](https://direito.love)`;

    // ===== Regras Globais (Google-only) =====
    const RegrasGlobais = `
**Estratégia de links — regra geral (vale para TODOS os prompts):**
- **Somente** utilizar **Google** para localizar conteúdos específicos.
- O **único link** permitido em qualquer resposta é o **link de busca no Google**.
- **Nunca** incluir links diretos para artigos/notícias/leis. **Sempre** apontar para a busca.
- Em **Base legal essencial**, descreva apenas **número do artigo, nome da lei e explicação** — **sem links**.

**Como montar a busca principal:**
- Query = \`<tema>\` + **3 sites sorteados** do pool (10) + termos extras (ex.: STJ/STF).
- Resultados variam por data/local; o leitor escolhe a **primeira fonte confiável**.
`;

    // ===== Templates =====
    const Templates = {
      aprender: (tema) => {
        const searchURL = makeSearchURL(tema, ['STJ', 'STF'], pickSites());
        const buscasProntas = makeQuickLinks(tema);
        return `Você é um professor universitário de Direito, com experiência em docência e atuação prática.

Seu papel é ensinar **${tema}** com profundidade, mas de forma didática e acessível para estudantes iniciantes ou intermediários. Nada de resposta rasa ou engessada.

**Estilo de resposta:**
- Comece **diretamente com o conceito**, sem introduções vazias.
- Linguagem clara e objetiva, mas com profundidade.
- Quando houver divergência doutrinária ou jurisprudencial, traga **somente os entendimentos majoritários** (STJ/STF).
- Conecte a explicação à prática forense.
${RegrasGlobais}

**🔎 Pesquisa no Google (link único desta resposta):**
${searchURL}

**Formatação obrigatória (em Markdown simples):**

## 🧩 Conceito direto (4 a 6 linhas)

## 📜 Base legal essencial
- Indique **artigo(s)** e **nome da lei** pertinentes.
- Explique o **conteúdo normativo** e a **aplicação**.
- **Sem links** nesta seção.

## ⚖️ Quadro comparativo
| Instituto | Quando se aplica | Exemplo rápido |
|----------|------------------|----------------|

## 🧠 Raciocínio jurídico passo a passo (com exemplo)
1. Situação jurídica.
2. Pressupostos legais.
3. Doutrina majoritária.
4. Entendimento STJ/STF (validado por leitura via busca).
5. Consequências práticas.
6. Medidas/recursos cabíveis.

## 💼 Exemplos práticos (3 mini-casos)

## 🧯 Erros comuns (3) + 🧨 Pegadinhas de prova (2)

## ✅ Checklist de prova (5 itens)

## 📚 Mini glossário (5 termos)

## 🔎 Buscas prontas
${buscasProntas}
${CTA}`;
      },

      treinar: (tema) => {
        const searchURL = makeSearchURL(tema, ['questões OAB', 'STJ', 'STF'], pickSites());
        return `Você é um elaborador de questões de Direito para treino universitário e OAB.

Parâmetros do treino:
- Nível: **Intermediário**
- Quantidade: **10** questões

**Regras:**
- Use **Markdown simples** (sem HTML).
- Questões de múltipla escolha (A–D), 1 correta + 3 plausíveis.
- Misture: conceito, prática e interpretação.
${RegrasGlobais}

**🔎 Pesquisa no Google (link único desta resposta):**
${searchURL}

**Tema:** ${tema}

**Formato da resposta:**
## Questões (1 a 10)
1. **Q1) Enunciado...**
- (linhas em branco)
---
2. **Q2) Enunciado...**
- (linhas em branco)
---
... (até Q10)

## Gabarito Comentado
- Q1) Letra C — justificativa breve (se citar lei/precedente, valide lendo conteúdo via busca).
- Q2) Letra A — justificativa breve
- ...${CTA}`;
      },

      noticias: (tema) => {
        const searchURL = makeSearchURL(tema, ['últimos 36 meses'], pickSites());
        return `Você é um curador de notícias e artigos jurídicos. Pesquise conteúdos dos **últimos 36 meses** sobre **${tema}** em sites jurídicos confiáveis. Evite blogs pessoais.

**Objetivo:** entregar **até 10 achados** relevantes, sem duplicatas.
${RegrasGlobais}

**🔎 Pesquisa no Google (link único desta resposta):**
${searchURL}

**Formato da resposta (Markdown):**
# Achados (até 10)
1) **Título aproximado** — Data: DD/MM/AAAA | Site sugerido: NOME
   - Resumo (2–3 linhas).
   - Observação: selecione na busca a **primeira fonte confiável**.
   - Link (Google — mesmo para todos): ${searchURL}

---
2) ...
---
10) ...${CTA}`;
      },

      casoreal: (tema) => {
        const searchURL = makeSearchURL(tema, ['caso real', 'jurisprudência', 'decisão', '2023..2025'], pickSites());
        const buscasProntas = makeQuickLinks(tema);
        return `Você é um analista jurídico. Encontre até **5 casos reais** sobre **${tema}**, publicados nos **últimos 36 meses** em sites jurídicos confiáveis.

**Objetivo:** mostrar o tema em ação (decisões, julgamentos, polêmicas reais).
${RegrasGlobais}

**🔎 Pesquisa no Google (link único desta resposta):**
${searchURL}

**Formato (Markdown):**
# Casos reais encontrados (até 5)
1. Título aproximado — Data: DD/MM/AAAA | Site sugerido: NOME
   - Resumo factual (3–4 linhas).
   - Comentário jurídico: relacione com "${tema}" (5–6 linhas).
   - Link (Google — mesmo para todos): ${searchURL}
2. ...
3. ...
4. ...
5. ...

## 🔎 Buscas prontas
${buscasProntas}
${CTA}`;
      }
    };

    // ===== Estado & elementos =====
    let current = { tema:"", prompts:{ aprender:"", treinar:"", noticias:"", casoreal:"" } };
    const el = {
      tema: document.getElementById('tema'),
      gerar: document.getElementById('gerar'),
      thinking: document.getElementById('thinking'),
      result: document.getElementById('result'),
      copyA: document.getElementById('copy-aprender'),
      copyT: document.getElementById('copy-treinar'),
      copyN: document.getElementById('copy-noticias'),
      copyC: document.getElementById('copy-casoreal'),
      reset: document.getElementById('reset'),
      book: document.getElementById('book-list')
    };

    // ===== Persistência (até 50 entradas) =====
    const BOOK_KEY = 'book_data_v5_google_random3_quicklinks';
    function loadBook(){ try { return JSON.parse(localStorage.getItem(BOOK_KEY) || '[]') || []; } catch { return []; } }
    function saveBook(arr){ try { localStorage.setItem(BOOK_KEY, JSON.stringify(arr)); } catch {} }
    function pushEntry(obj){
      let data = loadBook();
      if(!Array.isArray(data)) data = [];
      data.unshift(obj);
      if(data.length > 50) data = data.slice(0,50);
      saveBook(data);
    }

    function renderBookAll(){
      const data = loadBook();
      el.book.innerHTML = '';
      if(!data.length){
        el.book.innerHTML = '<div class="item"><div class="meta"><div class="obj">Arquivo vazio</div><div class="tema">Você ainda não gerou nenhum prompt.</div></div></div>';
        return;
      }
      const frag = document.createDocumentFragment();
      data.forEach(({objetivo, tema, prompt})=>{
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `<div class="meta"><div class="obj">${objetivo||'—'}</div><div class="tema">${(tema||'').slice(0,300)}</div></div>
        <button class="btn btn-ghost" data-prompt>Copiar</button>`;
        const btn = div.querySelector('[data-prompt]');
        btn.addEventListener('click', async ()=>{
          try{
            await navigator.clipboard.writeText(String(prompt||''));
            btn.textContent = 'Copiado!';
            setTimeout(()=>btn.textContent='Copiar',1000);
          }catch{
            alert('Não foi possível copiar.');
          }
        });
        frag.appendChild(div);
      });
      el.book.appendChild(frag);
    }

    function strategyHumanName(k){
      const map = { aprender:'APRENDER', treinar:'TREINAR', noticias:'NOTÍCIAS', casoreal:'CASO REAL' };
      return map[k] || k;
    }

    // ===== Geração =====
    function genAll(){
      const tema = (el.tema.value || '').trim();
      if(!tema){ alert('Digite o tema.'); el.tema.focus(); return; }
      current.tema = tema;
      el.result.style.display = 'none';
      el.thinking.style.display = 'flex';
      el.gerar.disabled = true;

      setTimeout(()=>{
        current.prompts.aprender  = Templates.aprender(tema);
        current.prompts.treinar   = Templates.treinar(tema);
        current.prompts.noticias  = Templates.noticias(tema);
        current.prompts.casoreal  = Templates.casoreal(tema);

        const ts = Date.now();
        pushEntry({ objetivo: strategyHumanName('aprender'), tema, prompt: current.prompts.aprender,  ts });
        pushEntry({ objetivo: strategyHumanName('treinar'),  tema, prompt: current.prompts.treinar,   ts });
        pushEntry({ objetivo: strategyHumanName('noticias'), tema, prompt: current.prompts.noticias,  ts });
        pushEntry({ objetivo: strategyHumanName('casoreal'), tema, prompt: current.prompts.casoreal,  ts });

        el.thinking.style.display = 'none';
        el.result.style.display = 'block';
        el.gerar.disabled = false;
      }, 600);
    }

    async function copy(text, btn){
      try{
        await navigator.clipboard.writeText(text);
        const hint = btn.querySelector('.hint');
        const old = hint.textContent;
        hint.textContent = 'copiado!';
        btn.disabled = true;
        setTimeout(()=>{ hint.textContent = old; btn.disabled = false; }, 1200);
      }catch{
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        try {
          document.execCommand('copy');
          const hint = btn.querySelector('.hint'); const old = hint.textContent;
          hint.textContent = 'copiado!'; setTimeout(()=>hint.textContent=old,1200);
        } catch {
          alert('Não foi possível copiar.');
        } finally {
          document.body.removeChild(ta);
        }
      }
    }

    function resetAll(){
      el.tema.value = ''; el.tema.focus();
      el.result.style.display = 'none';
      el.thinking.style.display = 'none';
    }

    // Listeners
    document.getElementById('gerar').addEventListener('click', genAll);
    document.getElementById('tema').addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='enter') genAll(); });
    document.getElementById('copy-aprender').addEventListener('click', ()=>copy(current.prompts.aprender,  document.getElementById('copy-aprender')));
    document.getElementById('copy-treinar').addEventListener('click', ()=>copy(current.prompts.treinar,   document.getElementById('copy-treinar')));
    document.getElementById('copy-noticias').addEventListener('click',()=>copy(current.prompts.noticias,  document.getElementById('copy-noticias')));
    document.getElementById('copy-casoreal').addEventListener('click',()=>copy(current.prompts.casoreal,  document.getElementById('copy-casoreal')));
    document.getElementById('reset').addEventListener('click', resetAll);

    // Inicializa
    selectTab('gerar');

    // ===== PWA: Service Worker + Instalação =====
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(()=>{});
      });
    }
    let deferredPrompt = null;
    const installBtn = document.getElementById('btn-install');
    const installNote = document.getElementById('install-note');

    window.addEventListener('beforeinstallprompt', (e)=>{
      e.preventDefault();
      deferredPrompt = e;
      if(installBtn) installBtn.style.display = 'inline-flex';
      if(installNote) installNote.style.display = 'block';
    });

    installBtn?.addEventListener('click', async ()=>{
      try{
        if(!deferredPrompt) return;
        installBtn.disabled = true;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } finally {
        installBtn.disabled = false;
        installBtn.style.display = 'none';
        if(installNote) installNote.style.display = 'none';
      }
    });

    window.addEventListener('appinstalled', ()=>{
      if(installBtn) installBtn.style.display = 'none';
      if(installNote) installNote.style.display = 'none';
    });
  </script>
</body>
</html>
