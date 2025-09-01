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
      document.documentElement.dataset.theme = scheme || 'auto';
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
    push('bot', r.ok ? '📄 Arquivo .md salvo.' :
