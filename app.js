<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>direito.love — Prompt & Pesquisa</title>
  <meta name="theme-color" content="#F5C400" />
  <link rel="icon" href="favicon.png" type="image/png" />
  <link rel="apple-touch-icon" href="favicon-180.png" />
  <style>
    :root{
      --bg:#FFFDF0; --surface:#ffffff; --text:#001840; --border:#e5e7eb;
      --primary:#102A71; --highlight:#F5C400; --highlight-light:#FFDC5F;
      --radius:12px; --shadow:0 4px 16px rgba(0,0,0,.05);
      --font:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,system-ui,sans-serif;
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      --bar-h: 56px;
      --success:#16a34a;
      --muted-btn:#e5e7eb;
      --news-btn:#16a34a;
      --news-btn-hover:#22c55e;
      --snap-offset: 96px;
      --btn-pad-y: 6px; --btn-pad-x:10px; --btn-font:12.5px; --btn-min-h:34px; --btn-min-w:96px;
      --chip-pad-y: 6px; --chip-pad-x:10px; --chip-font:12.5px; --chip-radius:8px;
    }
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);font:400 13px/1.45 var(--font);}

    /* Topbar */
    .topbar{position:sticky; top:0; z-index:100; background:var(--highlight); border-bottom:1px solid rgba(0,0,0,.08)}
    .topbar__inner{max-width:1160px; margin:0 auto; padding:8px 12px; display:flex; align-items:center; justify-content:space-between; gap:12px}
    .brand{display:flex; align-items:center; gap:10px; text-decoration:none; color:#111}
    .brand__logo{height:32px}
    .chip{
      padding:var(--chip-pad-y) var(--chip-pad-x); border-radius:var(--chip-radius);
      background:#fff; border:1px solid var(--border);
      font-size:var(--chip-font); color:var(--primary); text-decoration:none; font-weight:600; transition:.15s
    }
    .chip[aria-current="page"], .chip.active{ background:#fff7d6; }

    /* Layout */
    .wrap{max-width:1160px;margin:0 auto;padding:18px 22px;}
    .grid{display:grid; grid-template-columns: 1fr 1fr; gap:18px;}
    @media(max-width: 960px){ .grid{ grid-template-columns: 1fr; } }

    h2{margin:0 0 8px;color:var(--primary)}
    h3{margin:10px 0 8px;color:var(--primary)}

    /* Campos */
    .field{margin:10px 0 14px;}
    .field label{display:block; font-weight:700; margin:0 0 6px;}
    .field textarea, .field input[type="text"]{
      width:100%; padding:10px 12px; border:2px solid var(--primary); border-radius:10px; font-size:15px; background:#fff;
    }
    .hint{margin:6px 0 0; color:#0f172a; background:#fff7d6; padding:8px 10px; border-radius:8px; display:none;}
    .hint.show{display:block;}

    /* Botões */
    .btn{
      appearance:none;border:1px solid var(--border);background:var(--highlight);color:#000;
      padding:var(--btn-pad-y) var(--btn-pad-x);border-radius:8px;
      font-size:var(--btn-font);cursor:pointer;transition:.15s; min-height:var(--btn-min-h); min-width:var(--btn-min-w);
    }
    .btn:hover{background:var(--highlight-light)}
    .btn-alt{
      appearance:none;border:1px solid #0f2a71;background:var(--primary);color:#fff;
      padding:var(--btn-pad-y) var(--btn-pad-x);border-radius:8px;
      font-size:var(--btn-font);cursor:pointer;transition:.15s; min-height:var(--btn-min-h); min-width:var(--btn-min-w);
    }
    .btn-alt:hover{background:#264399}
    .btn-alt.is-selected{ background: var(--success); color:#fff; border-color:#168a44; }
    .btn-alt.is-selected:hover{ filter:brightness(.95); }
    .btn-news{
      background:var(--news-btn);color:#fff;text-decoration:none;display:inline-block;
      padding:var(--btn-pad-y) var(--btn-pad-x);border-radius:8px;font-size:var(--btn-font);
      min-height:var(--btn-min-h); min-width:var(--btn-min-w); margin-left:auto; border:1px solid #0e8f42;
    }
    .btn-news:hover{background:var(--news-btn-hover)}

    /* Cards & acordeões */
    .card{background:#fff; border:1px solid var(--border); border-radius:12px; box-shadow:var(--shadow); padding:12px 14px;}
    .card + .card{margin-top:10px;}
    .card-head{display:flex; align-items:center; gap:8px; justify-content:space-between;}
    .card-title{font-weight:800; color:var(--primary)}
    .obj-desc{margin:6px 0 0; color:#0f172a}
    @media(max-width:600px){ .obj-desc{ font-size:12px; } } /* <= menor no mobile */

    details.acc{ background:var(--surface); border:1px solid var(--border); border-radius:12px; box-shadow:var(--shadow); overflow:hidden; }
    details.acc + details.acc{ margin-top:12px; }
    details.acc > summary{
      list-style:none; cursor:pointer; padding:10px 14px; font-weight:800; color:var(--primary);
      display:flex; align-items:center; justify-content:space-between;
    }
    details.acc > summary::-webkit-details-marker{ display:none; }
    details.acc[open] > summary{ background:#fff7d6; }
    .acc-count{ font-weight:700; background:#0f172a0d; color:#0f172a; padding:2px 8px; border-radius:999px; font-size:12px; }
    .acc-body{ padding: 10px 14px; }

    /* Pesquisa */
    .search-box{display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin:10px 0 14px;}
    #busca{flex:1; padding:10px 12px; border:2px solid var(--primary); border-radius:8px; font-size:15px}
    #btnBuscar{border:1px solid var(--primary); background:var(--primary); color:#fff;}
    .result{
      background:#fff;border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);
      padding:12px 14px;margin:10px 0;position:relative;
    }
    .filetag{
      display:inline-block; font-weight:700; font-size:12px; padding:2px 8px; border-radius:999px;
      background:#f1f5f9; color:#0f172a; margin:0 0 8px 0;
    }
    .result p{margin:0;font-size:13px;line-height:1.55}
    .actions{margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .toggle-more{ margin-left:6px; background:none; border:0; color:var(--primary); cursor:pointer; font-size:12px; padding:2px 4px; line-height:1; }
    mark.hl{ background:#CFF7CF; padding:0 2px; border-radius:3px; }

    /* Barras fixas */
    .bar{position:fixed; left:50%; transform:translateX(-50%);
      bottom:calc(10px + var(--safe-bottom)); z-index:9999; background:#111; color:#fff;
      padding:8px 10px; border-radius:12px; display:none; align-items:center; gap:8px;
      box-shadow:0 6px 20px rgba(0,0,0,.25); font: 500 13px/1.2 var(--font); pointer-events:none;}
    .bar button{ pointer-events:auto; }
    #sel-bar button{ border:1px solid var(--border); border-radius:8px; font-size:var(--btn-font); min-height:var(--btn-min-h); min-width:var(--btn-min-w); }
    #sel-enviar{ background: var(--primary); color:#fff; border-color:#0f2a71; }
    #sel-limpar{ background:#fff; color:#111; }

    #prompt-bar button{ border:1px solid var(--border); border-radius:8px; font-size:var(--btn-font); min-height:var(--btn-min-h); min-width:var(--btn-min-w); }
    #btnGerar{ background: var(--primary); color:#fff; border-color:#0f2a71; }
    #btnLimpar{ background:#fff; color:#111; }
    #btnCopiar{ background: var(--primary); color:#fff; display:none; }
    #btnNovo{ background:#fff; color:#111; display:none; }

    /* Chips IA overlay */
    .ia-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:none; align-items:center; justify-content:center; z-index:10000; }
    .ia-modal{ background:#fff; border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow); width:min(560px, 92vw); padding:16px; }
    .ia-title{ font-weight:800; color:var(--primary); margin:0 0 10px; }
    .ia-chips{ display:flex; flex-wrap:wrap; gap:8px; }
    .ia-chip{ display:inline-block; padding:6px 10px; border-radius:999px; border:1px solid var(--border); background:#fff; text-decoration:none; color:#0f172a; font-weight:600; font-size:13px; }
    .ia-actions{ display:flex; justify-content:flex-end; margin-top:12px; gap:8px; }

    /* Router helpers */
    [hidden]{ display:none !important; }

    /* Toast */
    .toast{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;background:#111;color:#fff;
      padding:8px 12px;border-radius:999px;opacity:0;transition:.2s;z-index:12000}
    .toast.show{opacity:1}
  </style>
</head>
<body>
  <header class="topbar" role="banner">
    <div class="topbar__inner">
      <a class="brand" href="#prompt" aria-label="Início">
        <img class="brand__logo" src="icons/logo.png" alt="direito.love" />
      </a>
      <nav class="topbar__actions" aria-label="Navegação">
        <a class="chip" id="tabPrompt" href="#prompt">Prompt</a>
        <a class="chip" id="tabPesquisa" href="#pesquisa">Pesquisar</a>
      </nav>
    </div>
  </header>

  <main class="wrap">
    <div class="grid">
      <!-- PROMPT -->
      <section id="sec-prompt">
        <h2>Criador de Prompt</h2>

        <div class="field">
          <label for="tema">Digite o tema ou utilize a pesquisa para encontrar:</label>
          <textarea id="tema" rows="5" placeholder="Ex: Dano moral por negativação indevida; ou envie trechos da pesquisa."></textarea>
          <div id="temaHint" class="hint">Tema definido. Agora selecione as sessões do seu prompt.</div>
        </div>

        <details class="acc" open>
          <summary>Sessões do prompt <span class="acc-count" id="countObj">0</span></summary>
          <div class="acc-body" id="objList"><!-- cards objetivos --></div>
        </details>

        <h3>Prévia do Prompt</h3>
        <div class="field"><textarea id="promptOut" rows="12" readonly placeholder="Gere o prompt para ver a prévia aqui."></textarea></div>
      </section>

      <!-- PESQUISA -->
      <section id="sec-pesquisa" hidden>
        <h2>Pesquisa de Conteúdo Jurídico</h2>
        <div class="search-box">
          <input id="busca" type="text" placeholder="Ex: art. 150 CP, súmula 381, dano moral..." />
          <button id="btnBuscar" class="btn">Buscar</button>
        </div>
        <div id="categorias"><!-- acordeões --></div>
      </section>
    </div>
  </main>

  <!-- Barra seleção PESQUISA -->
  <div id="sel-bar" class="bar" aria-live="polite">
    <button id="sel-enviar" class="btn">Enviar para o Prompt</button>
    <button id="sel-limpar" class="btn">Limpar</button>
  </div>

  <!-- Barra ações PROMPT -->
  <div id="prompt-bar" class="bar" aria-live="polite">
    <button id="btnGerar" class="btn">Gerar Prompt</button>
    <button id="btnLimpar" class="btn">Limpar</button>
    <button id="btnCopiar" class="btn">Copiar Prompt</button>
    <button id="btnNovo" class="btn">Novo</button>
  </div>

  <!-- Overlay de IAs -->
  <div id="iaOverlay" class="ia-overlay">
    <div class="ia-modal">
      <h3 class="ia-title">Abrir seu prompt em outra IA</h3>
      <div class="ia-chips" id="iaChips">
        <!-- links gerados -->
      </div>
      <div class="ia-actions">
        <button id="iaClose" class="btn">Fechar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast" aria-live="polite"></div>

<script>
(function(){
  /* ======= helpers ======= */
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const toast=(m,t=1600)=>{const el=$("#toast");el.textContent=m;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),t);};

  /* ======= Router ======= */
  function setActiveTab(){
    const h=location.hash||'#prompt';
    $("#sec-prompt").hidden = h!=='#prompt';
    $("#sec-pesquisa").hidden = h!=='#pesquisa';
    $("#tabPrompt").classList.toggle('active', h==='#prompt');
    $("#tabPesquisa").classList.toggle('active', h==='#pesquisa');
    // mostrar barras certas
    $('#prompt-bar').style.display = (h==='#prompt') ? 'flex' : 'none';
    $('#sel-bar').style.display    = (h==='#pesquisa' && getCarrinho().length>0) ? 'flex' : 'none';
  }
  window.addEventListener('hashchange', setActiveTab);

  /* ======= Estado ======= */
  const state = {
    baseDados: [],
    temaTimer: null,
    objetivosSel: new Set(),
  };

  /* ======= Normalização / Busca ======= */
  const norm = (s="") => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function hasWhole(hay, word){ if(!word) return true; const re=new RegExp(`(^|[^a-z0-9])${esc(word)}([^a-z0-9]|$)`,'i'); return re.test(hay); }
  function hasAllWords(hay, words){ for(const w of words){ if(!hasWhole(hay,w)) return false; } return true; }
  const romanLower = s => String(s).replace(/[^ivxlcdm]/gi,'').toLowerCase();

  function normalizeLegal(s){
    let t=norm(s);
    t=t.replace(/\bpar\.?\b/g,' paragrafo ');
    t=t.replace(/\bart\.?\b|\bartigo\b/g,' art ');
    t=t.replace(/\binc\.?\b/g,' inciso ');
    t=t.replace(/\bal\.?\b/g,' alinea ');
    t=t.replace(/(\d+)\s*[ºªoa]\b/g,'$1');
    t=t.replace(/["'()]/g,' ').replace(/\s+/g,' ').trim();
    return t;
  }
  function tokenizeLegal(s){
    const t = normalizeLegal(s);
    return t.split(/[^a-z0-9]+/).filter(Boolean);
  }
  function normalizarFonte(f){ return f && f.startsWith('noticias') ? 'noticias' : f; }

  function fonteFromQueryPad(base){
    const padded = ` ${base} `;
    const map = [
      { re:/\b(cp|cpb|codigo penal( brasileiro)?)\b/,              fonte:'codigo_penal' },
      { re:/\b(cpp|codigo de processo penal)\b/,                    fonte:'codigo_processo_penal' },
      { re:/\b(cc|codigo civil)\b/,                                 fonte:'codigo_civil' },
      { re:/\b(cpc|codigo de processo civil)\b/,                    fonte:'codigo_processo_civil' },
      { re:/\b(ctn|codigo tributario nacional)\b/,                  fonte:'codigo_tributario_nacional' },
      { re:/\b(cdc|codigo de defesa do consumidor)\b/,              fonte:'codigo_defesa_consumidor' },
      { re:/\b(ctb|codigo de transito brasileiro)\b/,               fonte:'codigo_transito_brasileiro' }
    ];
    for(const a of map){ if(a.re.test(padded)) return a.fonte; }
    return null;
  }
  function tribunalFromQuery(base){
    const padded = ` ${base} `;
    if (/\bstf\b|supremo\b/.test(padded)) return 'stf';
    if (/\bstj\b/.test(padded)) return 'stj';
    if (/\btse\b|eleitoral\b/.test(padded)) return 'tse';
    return null;
  }
  function classifyIntent(base){
    const padded = ` ${base} `;
    if (/\bnoticia(s)?\b|migalhas\b/.test(padded)) return 'noticias';
    if (/\bs[uú]mula\b|\bsv\b|vinculante\b/.test(padded)) return 'sumula';
    if (/\btema(s)?(\s+repetitivo(s)?)?\b/.test(padded)) return 'tema';
    if (/\btese(s)?\b/.test(padded)) return 'tese';
    if (/\b(adi|adpf|adc|resp|aresp|re|are|hc|rms|agint|agrg|edcl|edv)\b/i.test(padded)) return 'juris';
    if (/\bart(\.|igo)?\b|\bparagrafo\b|\binciso\b|\balinea\b/.test(padded) || fonteFromQueryPad(base)) return 'codigo';
    return 'geral';
  }
  function parseLegalQuery(raw){
    const base = normalizeLegal(raw);
    const padded = ` ${base} `;
    const fonteFilter = fonteFromQueryPad(base);
    const tribHint = tribunalFromQuery(base);
    const intent = classifyIntent(base);

    let artNum=null; { const m=padded.match(/\bart\s*([0-9]{1,4})(?:[\-]?[a-z])?\b/); if(m) artNum=m[1]; }
    let paragrafo=null; { const m=padded.match(/\bparagrafo\s*(unico|\d+)\b/); if(m) paragrafo=m[1]; }
    let inciso=null; { const m=padded.match(/\binciso\s*([ivxlcdm]+)\b/); if(m) inciso=romanLower(m[1]); }
    let alinea=null; { const m=padded.match(/\balinea\s*([a-z])\b/); if(m) alinea=m[1].toLowerCase(); }
    const caput = /\bcaput\b/.test(padded);

    let sumulaNum=null; { const m=(raw.match(/\bs[úu]mula(?:\s+vinculante)?\s*(\d{1,4})/i) || raw.match(/\bsv\s*(\d{1,4})\b/i)); if(m) sumulaNum=m[1]; }
    let temaNum=null;   { const m=raw.match(/\btema(?:\s+repetitivo)?\s*(\d{1,4})\b/i); if(m) temaNum=m[1]; }
    let teseNum=null;   { const m=raw.match(/\btese\s*(\d{1,4})\b/i); if(m) teseNum=m[1]; }

    const STOP=new Set(['de','da','do','das','dos','e','ou','a','o','as','os','no','na','nos','nas','para','por','em','um','uma','ao','à','que','com','sem','sobre','entre','ate']);
    const all = base.split(' ').filter(Boolean);
    const seq = [];
    for(const tok of all){ if(STOP.has(tok)) continue; seq.push(tok); }

    const structSeq = [];
    if(artNum){ structSeq.push('art', String(artNum)); if(paragrafo){ structSeq.push('paragrafo', String(paragrafo)); } if(inciso){ structSeq.push('inciso', String(inciso)); } if(alinea){ structSeq.push('alinea', String(alinea)); } if(caput){ structSeq.push('caput'); } }
    if(sumulaNum){ structSeq.push(String(sumulaNum)); }
    if(temaNum){ structSeq.push(String(temaNum)); }
    if(teseNum){ structSeq.push(String(teseNum)); }

    const wordsSet=new Set(seq);
    if(artNum){ wordsSet.add('art'); wordsSet.add(String(artNum)); }
    if(paragrafo){ wordsSet.add('paragrafo'); wordsSet.add(String(paragrafo)); }
    if(inciso){ wordsSet.add('inciso'); wordsSet.add(String(inciso)); }
    if(alinea){ wordsSet.add('alinea'); wordsSet.add(String(alinea)); }
    if(caput){ wordsSet.add('caput'); }
    if(sumulaNum){ wordsSet.add(String(sumulaNum)); }
    if(temaNum){ wordsSet.add(String(temaNum)); }
    if(teseNum){ wordsSet.add(String(teseNum)); }

    return {
      intent, fonteFilter, tribHint,
      artNum, paragrafo, inciso, alinea, caput, sumulaNum, temaNum, teseNum,
      seq: structSeq.length>=2 ? structSeq : seq,
      words:[...wordsSet]
    };
  }

  const MAX_GAP = 1;
  function proximityScore(tokens, seq, maxGap=MAX_GAP){
    if(!seq || seq.length<2) return -1;
    let pos=-1, penalty=0;
    for(let i=0;i<seq.length;i++){
      const term=seq[i];
      let found=-1;
      for(let j=pos+1;j<tokens.length;j++){
        if(tokens[j]===term){
          if(pos>=0 && (j-pos-1)>maxGap) { /* continue buscando */ }
          else { found=j; break; }
        }
      }
      if(found===-1) return Number.NEGATIVE_INFINITY;
      if(pos>=0) penalty+=(found-pos-1);
      pos=found;
    }
    return penalty;
  }

  /* ======= Carregar base (lazy: ao abrir pesquisa) ======= */
  const arquivos = [
    "data/julgados_direito_administrativo.json",
    "data/julgados_direito_ambiental.json",
    "data/julgados_direito_bancario.json",
    "data/julgados_direito_civil.json",
    "data/julgados_direito_constitucional.json",
    "data/julgados_direito_eleitoral.json",
    "data/julgados_direito_empresarial.json",
    "data/noticias_migalhas_1.json",
    "data/noticias_migalhas_2.json",
    "data/noticias_migalhas_3.json",
    "data/codigo_penal.json",
    "data/codigo_processo_penal.json",
    "data/sumula_stf.json",
    "data/sumulas_stj.json",
    "data/sumulas_tse.json",
    "data/sumulas_vinculantes_stf.json",
    "data/temas_repetitivos_stj.json",
    "data/teses_stf.json",
    "data/codigo_processo_civil.json",
    "data/codigo_civil.json",
    "data/codigo_tributario_nacional.json",
    "data/codigo_defesa_consumidor.json",
    "data/codigo_transito_brasileiro.json"
  ];
  const nomesAmigaveis = {
    noticias: "Notícias",
    noticias_migalhas_1: "Notícias Migalhas", noticias_migalhas_2:"Notícias Migalhas", noticias_migalhas_3:"Notícias Migalhas",
    sumula_stf: "Súmulas STF", sumulas_stj:"Súmulas STJ", sumulas_tse:"Súmulas TSE",
    sumulas_vinculantes_stf:"Súmulas Vinculantes STF", temas_repetitivos_stj:"Temas Repetitivos STJ", teses_stf:"Teses STF",
    codigo_tributario_nacional:"Código Tributário Nacional", codigo_penal:"Código Penal",
    codigo_civil:"Código Civil", codigo_processo_penal:"Código de Processo Penal", codigo_processo_civil:"Código de Processo Civil",
    julgados_direito_administrativo:"Julgados de Direito Administrativo", julgados_direito_ambiental:"Julgados de Direito Ambiental",
    julgados_direito_bancario:"Julgados de Direito Bancário", julgados_direito_civil:"Julgados de Direito Civil",
    julgados_direito_constitucional:"Julgados de Direito Constitucional", julgados_direito_eleitoral:"Julgados de Direito Eleitoral",
    julgados_direito_empresarial:"Julgados de Direito Empresarial", codigo_defesa_consumidor:"Código de Defesa do Consumidor",
    codigo_transito_brasileiro:"Código de Trânsito Brasileiro"
  };
  const catOrder=["noticias","codigos","sumulas","julgados","temas_repetitivos_stj","teses_stf","outros"];
  const categorias={
    noticias:{label:"Notícias", match:f=>f.startsWith("noticias")},
    codigos:{label:"Códigos", match:f=>f.startsWith("codigo_")},
    sumulas:{label:"Súmulas", match:f=>f.startsWith("sumula")||f.startsWith("sumulas_")||f==="sumulas_vinculantes_stf"},
    julgados:{label:"Julgados", match:f=>f.startsWith("julgados_")},
    temas_repetitivos_stj:{label:"Temas Repetitivos STJ", match:f=>f==="temas_repetitivos_stj"},
    teses_stf:{label:"Teses STF", match:f=>f==="teses_stf"},
    outros:{label:"Outros", match:f=>true}
  };

  async function carregarDados(){
    if(state.baseDados.length) return;
    const dados=[];
    for(const arq of arquivos){
      try{
        const tag=arq.split('/').pop().replace(/\.json$/,'');
        const r=await fetch(arq); if(!r.ok) continue;
        const j=await r.json();
        (Array.isArray(j)?j:[]).forEach((it,idx)=>{
          const _id=it.id||`${tag}_${idx}`;
          const parts=[];
          if(it.titulo) parts.push(String(it.titulo));
          if(it.ementa) parts.push(String(it.ementa));
          if(it.resumo) parts.push(String(it.resumo));
          if(it.texto)  parts.push(String(it.texto));
          if(it.caput)  parts.push(String(it.caput));
          if(Array.isArray(it.paragrafos)) parts.push(it.paragrafos.join(' '));
          if(Array.isArray(it.incisos))    parts.push(it.incisos.join(' '));
          if(it.sumula) parts.push(String(it.sumula));
          if(it.conteudo) parts.push(String(it.conteudo));
          if(it.artigo)   parts.push(String(it.artigo));
          const textoIndex = parts.join(' • ').trim();

          const textoNorm = norm(textoIndex);
          const textoLegal= normalizeLegal(textoIndex);
          const tokens    = tokenizeLegal(textoIndex);

          let artNumDoc=null;
          if (it.artigo){ const m=String(it.artigo).match(/art\.?\s*([0-9]{1,4})/i); if(m) artNumDoc=m[1]; }
          if(!artNumDoc && /^codigo_/.test(tag)){ const m2=textoIndex.match(/art\.?\s*([0-9]{1,4})/i); if(m2) artNumDoc=m2[1]; }

          let sumulaNumDoc=null; { const m1=textoIndex.match(/S[úu]mula(?: Vinculante)?\s*(\d{1,4})/i); if(m1) sumulaNumDoc=m1[1]; }
          let temaNumDoc=null;   { const m2=textoIndex.match(/\bTema(?: Repetitivo)?\s*(\d{1,4})\b/i); if(m2) temaNumDoc=m2[1]; }
          let teseNumDoc=null;   { const m3=textoIndex.match(/\bTese\s*(\d{1,4})\b/i); if(m3) teseNumDoc=m3[1]; }

          let tribDoc=null;
          if (/sumula_stf|sumulas_vinculantes_stf|teses_stf/.test(tag)) tribDoc='stf';
          else if (/sumulas_stj|temas_repetitivos_stj/.test(tag)) tribDoc='stj';
          else if (/sumulas_tse/.test(tag)) tribDoc='tse';

          dados.push({ ...it, _id, fonte:tag, texto:textoIndex, textoNorm, textoLegal, tokens,
            artNum:artNumDoc, sumulaNum:sumulaNumDoc, temaNum:temaNumDoc, teseNum:teseNumDoc, tribDoc });
        });
      }catch(e){ console.warn('Erro ao carregar',arq,e); }
    }
    state.baseDados = dados;
    toast('Base carregada com sucesso!');
  }

  /* ======= Busca com proximidade e ranking ======= */
  function scoreDoc(doc, q, prox){
    let s=0;
    if (q.intent==='noticias' && normalizarFonte(doc.fonte)==='noticias') s+=8;
    if (q.intent==='sumula'){
      if (/^sumulas?_|^sumula_/.test(doc.fonte)) s+=7;
      if (q.tribHint && doc.tribDoc===q.tribHint) s+=4;
      if (q.sumulaNum && String(doc.sumulaNum||'')===String(q.sumulaNum)) s+=10;
    }
    if (q.intent==='tema'){ if (doc.fonte==='temas_repetitivos_stj') s+=7; if (q.temaNum && String(doc.temaNum||'')===String(q.temaNum)) s+=10; }
    if (q.intent==='tese'){ if (doc.fonte==='teses_stf') s+=7; if (q.teseNum && String(doc.teseNum||'')===String(q.teseNum)) s+=10; }
    if (q.intent==='codigo'){
      if (q.fonteFilter && normalizarFonte(doc.fonte)===q.fonteFilter) s+=8;
      if (q.artNum && String(doc.artNum||'')===String(q.artNum)) s+=12;
      if (q.paragrafo && hasWhole(doc.textoLegal,'paragrafo') && hasWhole(doc.textoLegal,String(q.paragrafo))) s+=2;
      if (q.inciso && hasWhole(doc.textoLegal,'inciso') && hasWhole(doc.textoLegal,String(q.inciso))) s+=2;
      if (q.alinea && hasWhole(doc.textoLegal,'alinea') && hasWhole(doc.textoLegal,String(q.alinea))) s+=2;
    }
    if (q.intent==='juris'){ if (/^julgados_/.test(doc.fonte)) s+=6; if (q.tribHint && doc.tribDoc===q.tribHint) s+=2; }
    if (q.words?.length){ for(const w of q.words){ if(hasWhole(doc.textoLegal,w)) s+=1; } }
    if(Number.isFinite(prox) && prox>=0){ s += (prox===0 ? 8 : prox===1 ? 6 : Math.max(0, 5 - prox)); }
    return s;
  }
  function escolherCandidatos(q, base){
    const f=normalizarFonte;
    if(q.intent==='noticias') return base.filter(d=>f(d.fonte)==='noticias');
    if(q.intent==='sumula') return base.filter(d=>/^sumulas?_|^sumula_/.test(d.fonte));
    if(q.intent==='tema') return base.filter(d=>d.fonte==='temas_repetitivos_stj');
    if(q.intent==='tese') return base.filter(d=>d.fonte==='teses_stf');
    if(q.intent==='codigo'){ if(q.fonteFilter) return base.filter(d=>f(d.fonte)===q.fonteFilter); return base.filter(d=>/^codigo_/.test(d.fonte)); }
    if(q.intent==='juris') return base.filter(d=>/^julgados_/.test(d.fonte));
    return base;
  }
  function buscarFlex(termoRaw){
    const q = parseLegalQuery(termoRaw||'');
    let cand = escolherCandidatos(q, state.baseDados);
    let struct=[];
    if (q.intent==='codigo' && q.artNum) struct=cand.filter(d=>String(d.artNum||'')===String(q.artNum));
    else if (q.intent==='sumula' && q.sumulaNum) struct=cand.filter(d=>String(d.sumulaNum||'')===String(q.sumulaNum));
    else if (q.intent==='tema' && q.temaNum) struct=cand.filter(d=>String(d.temaNum||'')===String(q.temaNum));
    else if (q.intent==='tese' && q.teseNum) struct=cand.filter(d=>String(d.teseNum||'')===String(q.teseNum));

    let text=[];
    if(q.seq && q.seq.length>=2){
      for(const d of cand){
        const pen=proximityScore(d.tokens, q.seq, MAX_GAP);
        if(Number.isFinite(pen) && pen>=0) text.push({doc:d, pen});
      }
    }else{
      for(const d of cand){ if(hasAllWords(d.textoLegal, q.words||[])) text.push({doc:d, pen:-1}); }
    }

    const byId=new Map();
    for(const x of struct){ byId.set(x._id, {doc:x, pen:-1}); }
    for(const x of text){
      const prev=byId.get(x.doc._id);
      if(!prev || (prev.pen<0 && x.pen>=0) || (prev.pen>=0 && x.pen>=0 && x.pen<prev.pen)){ byId.set(x.doc._id, x); }
    }
    let results=Array.from(byId.values());
    results.sort((a,b)=> scoreDoc(b.doc,q,b.pen) - scoreDoc(a.doc,q,a.pen) );
    return {docs: results.map(x=>x.doc), q};
  }

  /* ======= Highlight sem quebrar acentos ======= */
  function buildNormMap(s){
    const map=[]; // array de chars normalizados (1:1 com original)
    for(const ch of s){
      const n = ch.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if(/[a-z0-9]/i.test(n)) map.push(n.toLowerCase());
      else map.push(' ');
    }
    return map.join('');
  }
  function highlightText(original, tokensToMark){
    if(!tokensToMark || !tokensToMark.length) return original;
    const normStr = buildNormMap(original);
    const ranges=[];
    for(const tok of tokensToMark){
      if(!tok || tok.length<2) continue; // ignora tokens muito curtos
      const re=new RegExp(`(^|[^a-z0-9])(${esc(tok)})(?=[^a-z0-9]|$)`,'gi');
      let m;
      while((m=re.exec(normStr))!==null){
        const start = m.index + m[1].length;
        const end = start + tok.length;
        ranges.push([start,end]);
      }
    }
    if(!ranges.length) return original;
    ranges.sort((a,b)=>a[0]-b[0]);
    // merge
    const merged=[];
    let cur=ranges[0];
    for(let i=1;i<ranges.length;i++){
      const r=ranges[i];
      if(r[0]<=cur[1]) cur[1]=Math.max(cur[1], r[1]); else { merged.push(cur); cur=r; }
    }
    merged.push(cur);
    // monta html usando índices no original (1:1 com normStr)
    let out='', i=0;
    for(const [s,e] of merged){
      out += original.slice(i,s) + '<mark class="hl">' + original.slice(s,e) + '</mark>';
      i=e;
    }
    out += original.slice(i);
    return out;
  }

  /* ======= Agrupar & Renderizar Pesquisa ======= */
  const MAX_SNIPPET=400, PAGE_SIZE=10;
  function groupResults(items){
    const groups={}; for(const id of Object.keys(categorias)){ groups[id]={ label:categorias[id].label, items:[], rendered:0 }; }
    items.forEach(it=>{
      const f = it.fonte || ''; let bucket='outros';
      for(const id of Object.keys(categorias)){ if(id==='outros') continue; if(categorias[id].match(f)){ bucket=id; break; } }
      groups[bucket].items.push(it);
    });
    const list=Object.entries(groups).filter(([,g])=>g.items.length>0)
      .sort((a,b)=>{ const diff=b[1].items.length-a[1].items.length; if(diff!==0) return diff; return catOrder.indexOf(a[0])-catOrder.indexOf(b[0]); });
    return Object.fromEntries(list);
  }

  const KEY='dl_pesquisa_selecionados';
  const getCarrinho=()=>JSON.parse(localStorage.getItem(KEY)||'[]');
  const setCarrinho=(a)=>localStorage.setItem(KEY, JSON.stringify(a));
  const dedupPush=(arr,item)=>{ const k=item.id||item._id||(item.fonte+':'+(item.texto||'').slice(0,50)); if(!arr.some(x=>x.id===k)) arr.push({...item,id:k}); return arr; };

  function buildCard(item, carrinho, highlightTokens){
    const fNorm=normalizarFonte(item.fonte);
    const isNoticias = fNorm==='noticias';
    const nomeBonito=(nomesAmigaveis[fNorm]||nomesAmigaveis[item.fonte]||item.fonte);

    const div=document.createElement('div'); div.className='result';

    const tag=document.createElement('div'); tag.className='filetag'; tag.textContent=nomeBonito; div.appendChild(tag);

    const p=document.createElement('p');
    const txt=(item.texto||'').trim();
    const isLong = txt.length>MAX_SNIPPET;
    const short = txt.substring(0,MAX_SNIPPET)+(isLong?'…':'');
    p.innerHTML = highlightText(short, highlightTokens);
    div.appendChild(p);

    if(isLong){
      const tg=document.createElement('button'); tg.type='button'; tg.className='toggle-more'; tg.textContent='Ver mais'; tg.dataset.expanded='0';
      tg.addEventListener('click',()=>{
        const on=tg.dataset.expanded==='1';
        if(on){ p.innerHTML = highlightText(txt.substring(0,MAX_SNIPPET)+'…', highlightTokens); tg.textContent='Ver mais'; tg.dataset.expanded='0'; }
        else { p.innerHTML = highlightText(txt, highlightTokens); tg.textContent='Ver menos'; tg.dataset.expanded='1'; }
      });
      p.after(tg);
    }

    const actions=document.createElement('div'); actions.className='actions';

    const copyText = (item.texto && item.texto.trim()) ? item.texto : [item.titulo||item.title||'', item.url||''].filter(Boolean).join(' — ');

    if(!isNoticias){
      const copiar=document.createElement('button'); copiar.textContent='Copiar'; copiar.className='btn';
      copiar.addEventListener('click', async()=>{ try{ await navigator.clipboard.writeText(copyText||''); toast('Copiado!'); }catch{ toast('Erro ao copiar.'); } });
      actions.appendChild(copiar);
    }

    const sel=document.createElement('button'); sel.className='btn-alt';
    const key=item.id||item._id||((item.fonte||'')+':'+(copyText||'').slice(0,50));
    const sync=(on)=>{ sel.textContent=on?'Selecionado':'Selecionar'; sel.classList.toggle('is-selected',on); };
    sync(carrinho.some(x=>x.id===key));
    sel.addEventListener('click',()=>{
      let arr=getCarrinho(); const obj={id:key, fonte:item.fonte, texto:copyText};
      if(arr.some(x=>x.id===key)){ arr=arr.filter(x=>x.id!==key); sync(false); }
      else{ arr=dedupPush(arr,obj); sync(true); }
      setCarrinho(arr); updateSelBar();
    });
    actions.appendChild(sel);

    if(item.url){
      const a=document.createElement('a'); a.textContent='Ver notícia'; a.href=item.url; a.target='_blank'; a.rel='noopener noreferrer'; a.className='btn-news';
      actions.appendChild(a);
    }

    div.appendChild(actions);
    return div;
  }

  function renderCategorias(groups, highlightTokens){
    const container=$("#categorias");
    container.innerHTML='';
    const entries=Object.entries(groups);
    if(entries.length===0){ container.innerHTML='<p>Nenhum resultado encontrado.</p>'; return; }
    for(const [catId, group] of entries){
      const det=document.createElement('details'); det.className='acc'; det.dataset.cat=catId; // começa fechado
      const sum=document.createElement('summary');
      const title=document.createElement('span'); title.textContent=group.label;
      const count=document.createElement('span'); count.className='acc-count'; count.textContent=group.items.length;
      sum.appendChild(title); sum.appendChild(count); det.appendChild(sum);

      const body=document.createElement('div'); body.className='acc-body';
      const moreWrap=document.createElement('div'); moreWrap.style.display='none'; moreWrap.style.textAlign='center'; moreWrap.style.padding='0 0 10px';
      const moreBtn=document.createElement('button'); moreBtn.className='btn'; moreBtn.textContent='Carregar mais';
      moreWrap.appendChild(moreBtn);

      det.appendChild(body); det.appendChild(moreWrap);

      function renderBatch(append=false){
        const carrinho=getCarrinho();
        const start=group.rendered;
        const end=Math.min(group.items.length, start+PAGE_SIZE);
        if(!append) body.innerHTML='';
        for(let i=start;i<end;i++){
          body.appendChild( buildCard(group.items[i], carrinho, highlightTokens) );
        }
        group.rendered=end;
        moreWrap.style.display = (group.rendered < group.items.length) ? 'block' : 'none';
      }

      det.addEventListener('toggle', ()=>{ if(det.open && group.rendered===0){ renderBatch(false); } });
      moreBtn.addEventListener('click', ()=> renderBatch(true) );

      container.appendChild(det);
    }
  }

  /* ======= Pesquisa: eventos ======= */
  async function ensureBaseOnSearch(){
    if(!state.baseDados.length){ await carregarDados(); }
  }
  $("#btnBuscar").addEventListener('click', async()=>{
    const termoRaw=$("#busca").value.trim();
    if(!termoRaw){ $("#categorias").innerHTML=''; updateSelBar(); return; }
    await ensureBaseOnSearch();
    const {docs, q} = buscarFlex(termoRaw);
    const groups = groupResults(docs);
    // tokens a destacar (q.words) – filtra muito curtos
    const hi = (q.words||[]).filter(w=>w && w.length>=2);
    renderCategorias(groups, hi);
    updateSelBar();
  });
  $("#busca").addEventListener('keydown', async(e)=>{ if(e.key==='Enter'){ e.preventDefault(); $("#btnBuscar").click(); } });

  /* ======= Barra seleção (pesquisa) ======= */
  function updateSelBar(){
    const has = getCarrinho().length>0;
    const onPesquisa = (location.hash||'#prompt')==='#pesquisa';
    $('#sel-bar').style.display = (onPesquisa && has) ? 'flex' : 'none';
  }
  $("#sel-enviar").addEventListener('click', ()=>{
    const items=getCarrinho();
    if(!items.length) return;
    const textos = items.map(x=>x.texto).filter(Boolean).join('\n\n');
    // cola no tema como se digitado
    const temaEl=$("#tema");
    temaEl.value = (temaEl.value ? (temaEl.value.trim()+'\n\n') : '') + textos;
    // mostra aviso
    showTemaHintSoon(true); // imediato pois veio da pesquisa
    // limpa seleção e vai para prompt
    localStorage.removeItem(KEY);
    updateSelBar();
    location.hash = '#prompt';
    toast('Conteúdo enviado para o Tema.');
  });
  $("#sel-limpar").addEventListener('click', ()=>{
    localStorage.removeItem(KEY);
    updateSelBar();
    [...$$('.btn-alt.is-selected', $("#categorias"))].forEach(b=>b.classList.remove('is-selected'));
    [...$$('.btn-alt', $("#categorias"))].forEach(b=>{ if(b.textContent==='Selecionado') b.textContent='Selecionar'; });
  });

  /* ======= Objetivos (cards com seletor à direita) ======= */
  const OBJETIVOS = [
    ["conceitos","Conceitos e Definições","Definições objetivas, linguagem clara e diferenciações essenciais, com 1–2 exemplos curtos."],
    ["base_legal","Base Legal Essencial","Citar artigos, parágrafos, incisos e súmulas diretamente relevantes, sem excesso."],
    ["juris_major","Jurisprudência Majoritária","Síntese da orientação predominante (STJ/STF), com teses e 1–2 precedentes."],
    ["doutrina","Doutrina Relevante","Autores e correntes principais, divergências e síntese crítica."],
    ["exemplos","Exemplos e Casos Práticos","2–3 situações típicas, com enquadramento e solução resumida."],
    ["comparativo","Quadro Comparativo","Tabela curta comparando institutos próximos (critérios e efeitos)."],
    ["questoes","Questões de Fixação","5–8 questões objetivas e 2 discursivas curtas com gabarito."],
    ["debates","Debates, Críticas e Tendências","Pontos controversos, evolução legislativa/jurisprudencial e riscos."],
    ["sumulas","Súmulas e Enunciados","Listar só as que realmente se aplicam; incluir sumulas vinculantes se houver."],
    ["peca_modelo","Estrutura de Peça / Modelos","Esqueleto de peça com tópicos e dicas de argumentação."],
    ["checklist_peca","Checklist de Peça","Lista de verificação antes de finalizar (endereçamento, pedidos, provas...)."],
    ["raciocinio","Raciocínio Jurídico (passo a passo)","Cadeia lógica para resolver o tema: fatos→norma→tese→pedido."],
    ["mapa","Mapa Mental","Mapa em tópicos hierárquicos para memorização rápida."],
    ["flashcards","Flashcards","Pares pergunta→resposta para revisão, em tom direto."],
    ["erros","Erros Comuns","Armadilhas e confusões frequentes; como evitar."],
    ["checklist_final","Checklist Final de Revisão","Verificações finais de conteúdo, forma e coerência."],
    ["leading","Casos Famosos / Leading Cases","Casos paradigmáticos, por que importam e como citar."],
    ["atualiz","Atualizações Recentes","Mudanças legais/jurisprudenciais relevantes ao tema."],
    ["prova","Dicas de Prova (OAB/Concursos)","Táticas de prova, pegadinhas e gestão de tempo."],
    ["refs","Referências Bibliográficas","Livros/artigos para leitura, em ABNT simplificada."]
  ];
  function renderObjetivos(){
    const list=$("#objList"); list.innerHTML='';
    let selCount=0;
    for(const [key,title,desc] of OBJETIVOS){
      const card=document.createElement('div'); card.className='card';
      const head=document.createElement('div'); head.className='card-head';
      const t=document.createElement('div'); t.className='card-title'; t.textContent=title;
      const btn=document.createElement('button'); btn.className='btn-alt'; btn.textContent='Selecionar';
      btn.style.marginLeft='auto';
      btn.addEventListener('click',()=>{
        if(state.objetivosSel.has(key)){ state.objetivosSel.delete(key); btn.textContent='Selecionar'; btn.classList.remove('is-selected'); }
        else { state.objetivosSel.add(key); btn.textContent='Selecionado'; btn.classList.add('is-selected'); }
        $("#countObj").textContent = String(state.objetivosSel.size);
      });
      head.appendChild(t); head.appendChild(btn);
      const p=document.createElement('p'); p.className='obj-desc'; p.textContent=desc;
      card.appendChild(head); card.appendChild(p);
      list.appendChild(card);
      if(state.objetivosSel.has(key)){ btn.textContent='Selecionado'; btn.classList.add('is-selected'); selCount++; }
    }
    $("#countObj").textContent = String(selCount);
  }
  renderObjetivos();

  /* ======= Tema: aviso após 3s da primeira letra ======= */
  const temaEl=$("#tema"), temaHint=$("#temaHint");
  function showTemaHintSoon(immediate=false){
    if(immediate){ temaHint.classList.add('show'); $('#prompt-bar').style.display='flex'; return; }
    clearTimeout(state.temaTimer);
    if(temaEl.value.trim().length===0){ temaHint.classList.remove('show'); return; }
    state.temaTimer = setTimeout(()=>{ temaHint.classList.add('show'); $('#prompt-bar').style.display='flex'; }, 3000);
  }
  temaEl.addEventListener('input', ()=> showTemaHintSoon(false));

  /* ======= Gerar / Copiar / Novo ======= */
  function buildPrompt(){
    const tema=temaEl.value.trim();
    if(!tema){ toast('Defina o tema primeiro.'); return ''; }
    if(state.objetivosSel.size===0){ toast('Selecione pelo menos uma sessão.'); return ''; }
    const map=new Map(OBJETIVOS.map(([k,t,d])=>[k,{t,d}]));
    let out = `TEMA:\n${tema}\n\nINSTRUÇÕES:\nVocê é um assistente jurídico. Responda com precisão, cite a base legal quando aplicável e organize como abaixo.\n\n`;
    for(const key of state.objetivosSel){
      const {t,d}=map.get(key)||{t:key,d:''};
      out += `## ${t}\n(${d})\n— Desenvolva de forma objetiva e estruturada.\n\n`;
    }
    out += `FORMATO:\n- Use linguagem clara e técnica.\n- Quando possível, inclua artigos/súmulas relevantes.\n- Evite excesso de texto irrelevante.\n`;
    return out.trim();
  }
  const promptOut=$("#promptOut");
  const btnGerar=$("#btnGerar"), btnLimpar=$("#btnLimpar"), btnCopiar=$("#btnCopiar"), btnNovo=$("#btnNovo");
  btnGerar.addEventListener('click', ()=>{
    const p=buildPrompt(); if(!p) return;
    promptOut.value=p;
    btnGerar.style.display='none'; btnLimpar.style.display='none';
    btnCopiar.style.display='inline-block'; btnNovo.style.display='inline-block';
    toast('Prompt gerado!');
  });
  btnLimpar.addEventListener('click', ()=>{
    temaEl.value=''; temaHint.classList.remove('show'); promptOut.value='';
    state.objetivosSel.clear(); renderObjetivos();
    btnGerar.style.display='inline-block'; btnLimpar.style.display='inline-block';
    btnCopiar.style.display='none'; btnNovo.style.display='none';
    toast('Limpado.');
  });
  btnNovo.addEventListener('click', ()=> btnLimpar.click());
  btnCopiar.addEventListener('click', async()=>{
    try{ await navigator.clipboard.writeText(promptOut.value||''); toast('Copiado!'); }catch{ toast('Erro ao copiar.'); return; }
    // mostrar chips IA
    showIAChips();
  });

  /* ======= IA chips ======= */
  const IA_TARGETS = [
    {name:'ChatGPT',   url:(t)=>`https://chat.openai.com/?q=${encodeURIComponent(t)}`},
    {name:'Claude',    url:(t)=>`https://claude.ai/new?prompt=${encodeURIComponent(t)}`},
    {name:'Gemini',    url:(t)=>`https://gemini.google.com/app?hl=pt-BR&query=${encodeURIComponent(t)}`},
    {name:'Copilot',   url:(t)=>`https://copilot.microsoft.com/?q=${encodeURIComponent(t)}`},
    {name:'Perplexity',url:(t)=>`https://www.perplexity.ai/?q=${encodeURIComponent(t)}`},
    {name:'Poe',       url:(t)=>`https://poe.com/new?prompt=${encodeURIComponent(t)}`},
  ];
  function showIAChips(){
    const box=$("#iaOverlay"), list=$("#iaChips"); list.innerHTML='';
    const txt=promptOut.value.slice(0, 5000); // evitar URLs gigantes
    for(const it of IA_TARGETS){
      const a=document.createElement('a'); a.className='ia-chip'; a.textContent=it.name; a.target='_blank'; a.rel='noopener noreferrer';
      a.href=it.url(txt);
      list.appendChild(a);
    }
    box.style.display='flex';
  }
  $("#iaClose").addEventListener('click', ()=>{
    $("#iaOverlay").style.display='none';
    // reinicia tela
    btnNovo.click();
  });

  /* ======= Pesquisa: boot lazy ao entrar na aba ======= */
  // carrega base na primeira vez que entrar na aba pesquisa
  const observer = new MutationObserver(async()=>{
    if(!$("#sec-pesquisa").hidden && state.baseDados.length===0){ await carregarDados(); }
  });
  observer.observe($("#sec-pesquisa"), {attributes:true, attributeFilter:['hidden']});

  /* ======= Inicial ======= */
  setActiveTab();

})();
</script>
</body>
</html>
