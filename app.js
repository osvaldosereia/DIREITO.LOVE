(function(){
/* =========================
   State & Utils
   ========================= */
const $ = s=>document.querySelector(s);
const el = (tag, cls, html)=>{ const x=document.createElement(tag); if(cls) x.className=cls; if(html!=null) x.innerHTML=html; return x; };
const sleep = ms=> new Promise(r=> setTimeout(r, ms));
const rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
const wait = (min=700,max=1200)=> matchMedia('(prefers-reduced-motion: reduce)').matches ? Promise.resolve() : sleep(rand(min,max));

/* Store helpers */
const LS = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def; }catch{ return def; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); return v; }
};

/* =========================
   Tema (helpers centrais)
   ========================= */
function effectiveTheme(pref){ // 'light' | 'dark' | 'auto' -> 'light' | 'dark'
  if (pref === 'dark' || pref === 'light') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(pref){ // aplica data-theme e atualiza barra
  const eff = effectiveTheme(pref);
  document.documentElement.setAttribute('data-theme', eff);
  // atualiza <meta name="theme-color"> controlado por JS (inserido no <head>)
  const meta = document.querySelector('meta[name="theme-color"][data-live]');
  if (meta) meta.setAttribute('content', eff === 'dark' ? '#15181c' : '#e9eaee');
  return eff;
}

/* NativeBridge (fallback web) */
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
    async importMarkdown(){
      return new Promise((resolve)=>{
        const input = document.createElement('input');
        input.type='file';
        input.accept='.md,text/markdown';
        input.onchange = async () => {
          const f = input.files?.[0];
          if(!f) return resolve({ ok:false, error:'cancel' });
          const text = await f.text();
          resolve({ ok:true, data:{ filename:f.name, content:text } });
        };
        input.click();
      });
    },
    async scheduleReminder(preset){
      setTimeout(()=>{
        push('bot','🔔 (Simulação) Lembrete acionado. No app, você receberá notificação local.');
      }, 800);
      return ok();
    },
    async openDeepLink(route){
      if(route) location.hash = route;
      return ok();
    },
    async setTheme(scheme){
      // aplica imediatamente também no PWA/web
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
      const dlg = $('#settings-modal'); if(dlg) dlg.showModal();
      return ok();
    }
  };
})();

/* =========================
   Labels & Strategies
   ========================= */
const labels = {
  prova:'Estudar p/ Prova',
  questoes:'Questões (A–E)',
  correlatos:'Artigos Correlatos',
  apresentacao:'Apresentação Oral (5min)',
  decoreba:'Estudo Rápido',
  casos:'Casos Concretos',
  testeRelampago:'🧪 Teste Rápido',
  mapaMental:'🧠 Mapa Mental',
  errosProva:'🎯 Erros Clássicos',
  quadroComparativo:'📚 Quadro Analítico'
};
const allStrategies = Object.keys(labels);

/* =========================
   Prompts (sem resumir)
   ========================= */
const Prompts = {
  prova: `Você é um **professor de Direito altamente didático**, especializado em provas da OAB e concursos jurídicos, escolhido pelo projeto **direito.love** para transformar qualquer tema em um estudo direto ao ponto, com profundidade e clareza.

🎯 OBJETIVO:
Ensinar o tema {{TEMA}} como se fosse a última revisão antes da prova.

📦 ENTREGÁVEL:
- Explicação clara, sem juridiquês, com foco no que costuma cair.
- Linguagem acessível, com precisão conceitual e técnica.
- Estrutura orientada para memorização e revisão.

📌 FORMATO DA ENTREGA:
1. **Conceito direto** (2 parágrafos com 3 a 4 linhas cada).
2. **Mapa mental em texto bem organizado, use ícones para decorar**.
3. **Exemplos típicos de prova**.
4. **Entendimento jurisprudencial majoritário (pesquise bem)**.
5. **Pegadinhas e confusões comuns (use ícones)**.
6. **Quadro comparativo** se houver institutos correlatos.
7. **Checklist final objetivo mas detalhado**.
8. **🔎 Buscas prontas**: 5 links Google “{{TEMA}} + palavra-chave”.

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
Avaliar rapidamente {{TEMA}} em 15 questões objetivas A–E.

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

/* =========================
   UI helpers
   ========================= */
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

/* =========================
   App logic
   ========================= */
let tema=''; const chosen = new Set();

function filenameFrom(tema){
  const slug = (tema||'tema').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const d = new Date(); const pad = n=> String(n).padStart(2,'0');
  const name = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}_${slug||'prompt'}.md`;
  return name;
}

function renderPromptCard(strategy){
  const card = el('div','prompt-card');
  const h = el('h3','prompt-title', tema);
  const ta = el('textarea'); ta.value = promptFor(strategy, tema);

  const row = el('div','row');

  const copy = el('button','btn'); copy.textContent="Copiar";
  const exportBtn = el('button','btn'); exportBtn.textContent="Exportar .md";
  const reminderBtn = el('button','btn'); reminderBtn.textContent="Lembrete";
  const novo = el('button','btn'); novo.textContent="Reiniciar";

  row.appendChild(copy);
  row.appendChild(exportBtn);
  row.appendChild(reminderBtn);
  row.appendChild(novo);

  card.appendChild(h);
  card.appendChild(ta);
  card.appendChild(row);

  copy.addEventListener('click', async ()=>{
    const r = await NativeBridge.copyPrompt(ta.value);
    push('bot', r.ok ? '✅ Copiado com sucesso!' : '⚠️ Falha ao copiar.');
    const historico = LS.get('historico', []);
    historico.unshift({
      titulo: tema,
      estrategia: labels[strategy] || strategy,
      prompt: ta.value,
      ts: Date.now()
    });
    LS.set('historico', historico.slice(0,200));
    const info = el('div','info-msg','✨ Pronto.<br>Agora é só colar<br>na sua I.A. preferida.');
    card.appendChild(info);
    setTimeout(()=>{ showRemaining(); }, 2500);
  });

  exportBtn.addEventListener('click', async ()=>{
    const name = filenameFrom(tema);
    const content = `# ${tema}
**Gerado em:** ${new Date().toLocaleString()}  
**App:** direito.love

## Prompt
${ta.value}

---
💚 direito.love
`;
    const r = await NativeBridge.exportMarkdown(name, content);
    push('bot', r.ok ? '📄 Arquivo .md salvo.' : '⚠️ Não foi possível salvar o .md.');
  });

  reminderBtn.addEventListener('click', async ()=>{
    const r = await NativeBridge.scheduleReminder('test');
    push('bot', r.ok ? '🔔 Lembrete agendado (modo demonstração no web).' : '⚠️ Não foi possível agendar o lembrete.');
  });

  novo.addEventListener('click', ()=>{
    tema=''; chosen.clear();
    push('bot','✨ Vamos lá! Digite um novo tema:');
    showInputBubble('Digite um novo tema…');
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

function showRemaining(){
  const remaining = allStrategies.filter(x=> !chosen.has(x));
  if(!remaining.length){
    push('bot','Fechamos todas as estratégias. Quer iniciar uma nova pesquisa?');
    return;
  }
  push('bot', `Experimente outra tarefa para <strong>${tema}</strong>`);
  showChips();
}

function showInputBubble(placeholder='Digite o tema…'){
  const wrap = el('div', 'input-bubble');
  const input = el('input'); input.placeholder=placeholder; input.autocomplete='off';
  const row = el('div','row');
  const send = el('button','iconbtn'); send.title='Enviar'; send.innerHTML='<img src="icons/send.svg" alt=""/>';
  row.appendChild(send); wrap.appendChild(input); wrap.appendChild(row);
  const bubble = push('bot', wrap);

  const submit = async ()=>{ 
    const text = input.value.trim(); if(!text) return input.focus();
    tema = text; bubble.closest('.msg')?.remove();
    push('user', `<div>${tema}</div>`);
    let t=typingStart(); await wait(); typingStop(t);
    push('bot', 'Beleza. Vou te mostrar as estratégias disponíveis.');
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
    b.addEventListener('click', ()=> handleStrategy(s));
    bar.appendChild(b);
  });
  push('bot', bar);
}

/* =========================
   Top bind & SW
   ========================= */
function bindTop(){
  // Nova pesquisa
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.addEventListener('click', ()=>{
    tema=''; chosen.clear(); showInputBubble('Digite o tema…');
  });

  // Abrir Configurações (⚙️)
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) btnSettings.addEventListener('click', ()=>{
    const dlg = document.getElementById('settings-modal');
    if (dlg && typeof dlg.showModal === 'function') dlg.showModal();
  });

  // Se o modal existir, ligar os controles
  const dlg = document.getElementById('settings-modal');
  if(dlg){
    const prefs = LS.get('prefs', { haptics:true, theme:'auto' });

    const hapt = document.getElementById('opt-haptics');
    const theme = document.getElementById('opt-theme');
    const newsBtn = document.getElementById('btn-news');
    const newsStatus = document.getElementById('news-status');

    if(hapt) hapt.checked = !!prefs.haptics;
    if(theme) theme.value = prefs.theme || 'auto';

    if(hapt) hapt.addEventListener('change', e=>{
      prefs.haptics = !!e.target.checked; LS.set('prefs', prefs);
      NativeBridge.toggleHaptics(prefs.haptics);
    });

    // 🔄 Tema: aplica no HTML e atualiza barra do navegador ao vivo
    if(theme) theme.addEventListener('change', e=>{
      prefs.theme = e.target.value; LS.set('prefs', prefs);
      applyTheme(prefs.theme);
      NativeBridge.setTheme?.(prefs.theme); // opcional se houver camada nativa
    });

    // 🔔 Novidades (se existir no HTML; guardado por if)
    if(newsBtn){
      newsBtn.addEventListener('click', async ()=>{
        try{
          const res = await fetch('news.json?v=' + Date.now());
          if(!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          const lastSeen = LS.get('lastNewsId', 0);
          const itens = (data.items||[]).map(x=>`• ${x.title} — ${x.date}`).join('\n');
          alert(itens || 'Sem novidades por enquanto.');
          const newest = (data.items&&data.items[0]&&data.items[0].id) || lastSeen;
          LS.set('lastNewsId', newest);
          if(newsStatus) newsStatus.textContent = '';
        }catch(e){
          alert('Não foi possível carregar as novidades agora.');
        }
      });
      (async ()=>{
        try{
          const res = await fetch('news.json?v=' + Date.now());
          if(!res.ok) return;
          const data = await res.json();
          const lastSeen = LS.get('lastNewsId', 0);
          const newest = (data.items&&data.items[0]&&data.items[0].id) || 0;
          if(newest > lastSeen && newsStatus){
            newsStatus.textContent = '🟢 Novo';
          }
        }catch{}
      })();
    }
  }
}

function registerSW(){ if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js?v=6').catch(()=>{}); }

/* =========================
   Deep Link (URL params)
   ========================= */
function params(){
  const q = new URLSearchParams(location.search);
  return { tema:q.get('tema')||'', estrategia:q.get('estrategia')||'' };
}

/* =========================
   Boot
   ========================= */
(async function init(){
  bindTop(); registerSW();

  // aplica tema salvo (e calcula dark/light efetivo) já no boot
  const prefs = LS.get('prefs', { haptics:true, theme:'auto', daily:false });
  applyTheme(prefs.theme || 'auto');

  let t=typingStart(); await wait(200,400); typingStop(t);
  push('bot','<strong>Bem-vindo</strong>');
  t=typingStart(); await wait(); typingStop(t);

  const p = params();
  if(p.tema){
    tema = p.tema;
    push('user', `<div>${tema}</div>`);
    await wait(200,400);
    if(p.estrategia && labels[p.estrategia]){
      await handleStrategy(p.estrategia);
      return;
    } else {
      push('bot', 'Beleza. Vou te mostrar as estratégias disponíveis.');
      await wait(300,600); showChips();
      return;
    }
  }

  push('bot','Qual é o tema?');
  showInputBubble();
})();
})();
