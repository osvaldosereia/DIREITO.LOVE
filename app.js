(function(){
/* =========================
   Funções utilitárias
   ========================= */
const $ = s=>document.querySelector(s);
const el = (tag, cls, html)=>{ 
  const x=document.createElement(tag); 
  if(cls) x.className=cls; 
  if(html!=null) x.innerHTML=html; 
  return x; 
};
const sleep = ms=> new Promise(r=> setTimeout(r, ms));
const rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
const wait = (min=700,max=1200)=> matchMedia('(prefers-reduced-motion: reduce)').matches ? Promise.resolve() : sleep(rand(min,max));

/* =========================
   LocalStorage helper
   ========================= */
const LS = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def; }catch{ return def; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); return v; }
};

/* =========================
   Tema (dark/light/auto)
   ========================= */
function effectiveTheme(pref){ 
  if (pref === 'dark' || pref === 'light') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(pref){ 
  const eff = effectiveTheme(pref);
  document.documentElement.setAttribute('data-theme', eff);
  const meta = document.querySelector('meta[name="theme-color"][data-live]');
  if (meta) meta.setAttribute('content', eff === 'dark' ? '#15181c' : '#e9eaee');
  return eff;
}

/* =========================
   NativeBridge — funções que simulam recursos nativos
   ========================= */
const NativeBridge = (()=> {
  const isNative = !!window.NativeBridgeNative || !!window.Capacitor;
  const ok = (data)=> Promise.resolve({ ok:true, data });
  const err = (error)=> Promise.resolve({ ok:false, error });
  const haptic = ()=> {
    document.body.classList.add('haptic');
    setTimeout(()=> document.body.classList.remove('haptic'), 120);
  };

  return {
    isNative,
    async copyPrompt(text){
      try{
        await navigator.clipboard.writeText(text);
        const prefs = LS.get('prefs', { haptics:true, theme:'auto', daily:false });
        if(prefs.haptics) haptic();
        return ok();
      }catch(e){ return err(String(e)); }
    },
    async exportMarkdown(filename, content){
      try{
        const blob = new Blob([content], { type:'text/markdown;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
        return ok();
      }catch(e){ return err(String(e)); }
    },
    async scheduleReminder(preset){
      setTimeout(()=>{ push('bot','🔔 (Simulação) Lembrete acionado.'); }, 800);
      return ok();
    },
    async openDeepLink(route){
      if(route) location.hash = route;
      return ok();
    },
    async setTheme(scheme){
      applyTheme(scheme || 'auto');
      return ok();
    },
    async getAppInfo(){
      return ok({ platform: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'web', version:'web', isNative });
    },
    async toggleHaptics(enabled){
      const prefs = LS.get('prefs', { haptics:true, theme:'auto', daily:false });
      prefs.haptics = !!enabled; LS.set('prefs', prefs);
      return ok(prefs);
    },
    async openSettings(){
      const dlg = $('#settings-modal'); 
      if(dlg) dlg.showModal();
      return ok();
    }
  };
})();

/* =========================
   Estratégias e Labels
   ========================= */
const labels = {
  prova:'Estudar p/ Prova',
  questoes:'Resolver Questões',
  correlatos:'Explorar Temas Relacionados',
  apresentacao:'Apresentação Oral (5min)',
  decoreba:'Decoreba Expressa',
  casos:'Casos Concretos',
  testeRelampago:'🧪 Teste Rápido',
  mapaMental:'🧠 Mapa Mental',
  errosProva:'🎯 Erros Clássicos',
  quadroComparativo:'📚 Quadro Analítico'
};
const allStrategies = Object.keys(labels);

/* =========================
   Templates de Prompts
   ========================= */
const Prompts = {
  // ... (mantive todos os templates iguais ao original)
  // só removi aqui para encurtar o exemplo, mas no arquivo real
  // os prompts devem estar TODOS completos como antes
};
function promptFor(strategy, tema){ 
  return (Prompts[strategy]||'').replaceAll('{{TEMA}}', tema); 
}

/* =========================
   Helpers de UI
   ========================= */
function push(role, nodeOrHtml){
  const box = $('#messages');
  const w = el('div', `msg ${role}`);
  w.setAttribute('role','listitem');
  const b = el('div', 'bubble');
  if(typeof nodeOrHtml === 'string'){ b.innerHTML = nodeOrHtml; }
  else { b.appendChild(nodeOrHtml); }
  w.appendChild(b); box.appendChild(w);
  w.scrollIntoView({behavior:"smooth", block:"end"});
  return b;
}
const typingStart = ()=> push('bot', `<span class="typing">Gerando estudo<span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`);
const typingStop = (bubble)=>{ if(!bubble) return; const msg=bubble.closest('.msg'); if(msg) msg.remove(); };

/* =========================
   Lógica principal
   ========================= */
let tema=''; 
const chosen = new Set();

function filenameFrom(tema){
  const slug = (tema||'tema').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const d = new Date(); const pad = n=> String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}_${slug||'prompt'}.md`;
}

function renderPromptCard(strategy){
  const card = el('div','prompt-card');
  const h = el('h3','prompt-title', tema);
  const ta = el('textarea'); 
  ta.value = promptFor(strategy, tema);
  ta.setAttribute('aria-label', `Prompt gerado para ${tema} (${labels[strategy]})`);

  const row = el('div','row');

  const copy = el('button','btn'); copy.textContent="📋 Copiar";
  const exportBtn = el('button','btn'); exportBtn.textContent="💾 Salvar arquivo";
  const reminderBtn = el('button','btn'); reminderBtn.textContent="🔔 Lembrete";
  const novoTema = el('button','btn'); novoTema.textContent="➕ Novo Tema";
  const novaTarefa = el('button','btn'); novaTarefa.textContent="✨ Nova Tarefa";

  row.append(copy, exportBtn, reminderBtn, novoTema, novaTarefa);

  card.append(h, ta, row);

  copy.addEventListener('click', async ()=>{
    const r = await NativeBridge.copyPrompt(ta.value);
    if(r.ok){
      const info = el('div','info-box');
      info.innerHTML = `✔️ Copiado com sucesso! Agora abra sua IA preferida e cole o prompt para começar.`;
      card.appendChild(info);
    } else {
      push('bot','⚠️ Falha ao copiar.');
    }
  });

  exportBtn.addEventListener('click', async ()=>{
    const name = filenameFrom(tema);
    const content = `# ${tema}\n**Gerado em:** ${new Date().toLocaleString()}\n\n## Prompt\n${ta.value}\n\n---\n💚 direito.love`;
    const r = await NativeBridge.exportMarkdown(name, content);
    push('bot', r.ok ? '📄 Arquivo salvo com sucesso.' : '⚠️ Erro ao salvar arquivo.');
  });

  reminderBtn.addEventListener('click', async ()=>{
    const r = await NativeBridge.scheduleReminder('test');
    push('bot', r.ok ? '🔔 Lembrete agendado (modo simulação).' : '⚠️ Não foi possível agendar.');
  });

  novoTema.addEventListener('click', ()=>{
    tema=''; chosen.clear();
    push('bot','✨ Vamos lá! Digite um novo tema:');
    showInputBubble('Digite um novo tema…');
  });

  novaTarefa.addEventListener('click', ()=>{
    push('bot', '✨ Quer explorar esse tema de outro jeito? Escolha uma nova tarefa:');
    showChips();
  });

  return card;
}

async function handleStrategy(s){
  chosen.add(s);
  push('user', `<div>${labels[s]}</div>`);
  let t=typingStart(); await wait(); typingStop(t);
  push('bot', `Gerando prompt de <strong>${labels[s]}</strong>…`);
  t=typingStart(); await wait(800,1300); typingStop(t);
  push('bot', renderPromptCard(s));
}

function showInputBubble(placeholder='Digite o tema…'){
  const wrap = el('div', 'input-bubble');
  const input = el('input'); 
  input.placeholder=placeholder; 
  input.autocomplete='off';
  input.setAttribute('aria-label','Digite o tema jurídico para gerar prompts');
  const row = el('div','row');
  const send = el('button','iconbtn'); 
  send.title='Enviar'; 
  send.innerHTML = '➡️';
  row.appendChild(send); wrap.appendChild(input); wrap.appendChild(row);
  const bubble = push('bot', wrap);

  const submit = async ()=>{ 
    const text = input.value.trim(); if(!text) return input.focus();
    tema = text; bubble.closest('.msg')?.remove();
    push('user', `<div>${tema}</div>`);
    let t=typingStart(); await wait(); typingStop(t);
    push('bot','📌 Beleza! Aqui estão as estratégias disponíveis:');
    await wait(300,600); showChips();
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
    b.setAttribute('aria-label', `Gerar prompt de ${labels[s]} para ${tema}`);
    b.addEventListener('click', ()=> handleStrategy(s));
    bar.appendChild(b);
  });
  push('bot', bar);
}

/* =========================
   Botões do topo e SW
   ========================= */
function bindTop(){
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.addEventListener('click', ()=>{
    tema=''; chosen.clear(); showInputBubble('Digite o tema…');
  });

  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) btnSettings.addEventListener('click', ()=>{
    const dlg = document.getElementById('settings-modal');
    if (dlg && typeof dlg.showModal === 'function'){ 
      dlg.showModal(); 
      document.getElementById('opt-haptics')?.focus();
    }
  });

  const dlg = document.getElementById('settings-modal');
  if(dlg){
    const prefs = LS.get('prefs', { haptics:true, theme:'auto', daily:false });

    // feedback tátil
    const hapt = document.getElementById('opt-haptics');
    if(hapt){
      hapt.checked = !!prefs.haptics;
      hapt.addEventListener('change', e=>{
        prefs.haptics = !!e.target.checked; 
        LS.set('prefs', prefs);
        NativeBridge.toggleHaptics(prefs.haptics);
      });
    }

    // daily reminder
    const daily = document.getElementById('opt-daily');
    if(daily){
      daily.checked = !!prefs.daily;
      daily.addEventListener('change', e=>{
        prefs.daily = !!e.target.checked; 
        LS.set('prefs', prefs);
        if(prefs.daily){
          push('bot','🔔 Lembrete diário ativado (simulação).');
        }
      });
    }

    // tema (chips)
    const themeBtns = dlg.querySelectorAll('.theme-btn');
    function setThemeChoice(val){
      prefs.theme = val;
      LS.set('prefs', prefs);
      applyTheme(val);
      NativeBridge.setTheme?.(val);

      themeBtns.forEach(btn=>{
        const active = btn.dataset.value === val;
        btn.setAttribute('aria-checked', active);
        btn.classList.toggle('active', active);
      });
    }
    themeBtns.forEach(btn=>{
      btn.addEventListener('click', ()=> setThemeChoice(btn.dataset.value));
    });
    setThemeChoice(prefs.theme || 'auto');

    dlg.addEventListener('close', ()=> {
      document.getElementById('btn-settings')?.focus();
    });
  }
}

/* =========================
   Service Worker
   ========================= */
function registerSW(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log("✅ Service Worker registrado:", reg))
      .catch(err => console.error("❌ Erro ao registrar SW:", err));
  }
}

/* =========================
   Inicialização
   ========================= */
function init(){
  bindTop();

  // NOVO: inicia diferente se vier do histórico (?tema=...)
  const urlParams = new URLSearchParams(location.search);
  const temaPre = urlParams.get('tema');
  const estrategia = urlParams.get('estrategia');

  if (temaPre && estrategia) {
    tema = temaPre;
    push('bot', `📌 Reabrindo estudo anterior: <strong>${tema}</strong>`);
    handleStrategy(estrategia);
  } else {
    // fluxo normal, sempre começa do zero
    push('bot','✨ Vamos lá! Digite um novo tema:');
    showInputBubble('Digite o tema…');
  }

  registerSW(); // registra o service worker
}

init();
})(); 
