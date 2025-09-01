(function(){
  const LS_KEY='chatBooyArchive', FILTER_KEY='chatBooyFilter';
  const root=document.getElementById('archive-root');
  const empty=document.getElementById('empty');
  const btnClear=document.getElementById('btn-clear');
  const btnFilter=document.getElementById('btn-filter');
  const pop=document.getElementById('filter-pop');
  const row=document.getElementById('filter-row');

  const esc=s=>(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const fmt=iso=>{ try{ return new Date(iso).toLocaleString() }catch(e){ return iso } };
  const load=()=>{ try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch(e){return[]} };
  const save=v=> localStorage.setItem(LS_KEY, JSON.stringify(v));
  const loadFilter=()=>{ try{return JSON.parse(localStorage.getItem(FILTER_KEY))||[]}catch(e){return[]} };
  const saveFilter=v=> localStorage.setItem(FILTER_KEY, JSON.stringify(v));
  const LABELS={
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

  function groupByTheme(items){
    const map={}; 
    for(const it of items){ 
      const k=it.theme||'(sem tema)'; 
      (map[k]=map[k]||[]).push(it); 
    }
    return map;
  }

  function currentStrategies(items){ 
    return Array.from(new Set(items.map(x=>x.strategy))).filter(Boolean); 
  }

  function buildFilterPills(){
    const data = load();
    const selected = new Set(loadFilter());
    row.innerHTML='';
    const list = currentStrategies(data);
    if(!list.length){ 
      row.innerHTML='<span class="small">Sem itens para filtrar.</span>'; 
      return; 
    }
    list.forEach(key=>{
      const b=document.createElement('button'); 
      b.className='pill'+(selected.has(key)?' active':'');
      b.textContent = LABELS[key] || key;
      b.addEventListener('click',()=>{
        if(selected.has(key)) selected.delete(key); else selected.add(key);
        saveFilter(Array.from(selected)); render();
      });
      row.appendChild(b);
    });
    const clear=document.createElement('button'); 
    clear.className='pill'; 
    clear.textContent='Limpar';
    clear.addEventListener('click',()=>{ 
      saveFilter([]); render(); 
    }); 
    row.appendChild(clear);
  }

  function applyFilter(items){
    const f=loadFilter(); 
    if(!f.length) return items;
    return items.filter(x=> f.includes(x.strategy));
  }

  function positionPop(){
    const rect = btnFilter.getBoundingClientRect();
    pop.style.left = rect.left+'px';
    pop.style.top = (rect.bottom + window.scrollY + 8) + 'px';
  }

  function render(){
    const all = load();
    const items = applyFilter(all);
    root.innerHTML=''; 
    empty.style.display = items.length ? 'none':'block';
    if(!items.length) return;

    const groups = groupByTheme(items);
    for(const theme of Object.keys(groups)){
      const g = groups[theme];
      const group=document.createElement('div'); 
      group.className='group';
      group.innerHTML=`<div class="group-h">
        <h3>${esc(theme)}</h3>
        <div class="meta small">${g.length} item(s)</div>
      </div>`;
      const itemsEl=document.createElement('div'); 
      itemsEl.className='items';

      g.forEach(rec=>{
        const card=document.createElement('div'); 
        card.className='card';
        card.innerHTML=`
          <div class="meta">
            <span class="tag">${esc(LABELS[rec.strategy]||rec.strategy)}</span>
            <span class="tag">${fmt(rec.createdAt)}</span>
          </div>
          <div class="actions">
            <button class="btn copy">📋 Copiar</button>
            <button class="btn open" data-ai="chatgpt">ChatGPT</button>
            <button class="btn open" data-ai="gemini">Gemini</button>
            <button class="btn open" data-ai="perplexity">Perplexity</button>
            <button class="btn reopen">↩️ Reabrir</button>
            <button class="btn del" style="margin-left:auto">🗑️ Excluir</button>
          </div>`;
        
        // eventos
        card.querySelector('.copy').addEventListener('click', async ()=>{
          await navigator.clipboard.writeText(rec.prompt); 
          alert('Copiado!');
        });
        card.querySelectorAll('.open').forEach(b=> b.addEventListener('click', ()=>{
          const map={
            chatgpt:'https://chat.openai.com/',
            gemini:'https://gemini.google.com/',
            perplexity:'https://www.perplexity.ai/'
          };
          const url = map[b.getAttribute('data-ai')]; 
          if(url) window.open(url,'_blank','noopener');
        }));
        card.querySelector('.reopen').addEventListener('click', ()=>{
          localStorage.setItem('chatBooyReopen', JSON.stringify({ theme: rec.theme, strategy: rec.strategy }));
          window.location.href='index.html';
        });
        card.querySelector('.del').addEventListener('click', ()=>{
          if(confirm('Excluir este registro?')){
            const L = load().filter(x=> x.id !== rec.id); 
            localStorage.setItem(LS_KEY, JSON.stringify(L)); 
            render();
          }
        });
        itemsEl.appendChild(card);
      });

      group.appendChild(itemsEl); 
      root.appendChild(group);
    }
  }

  btnClear.addEventListener('click', ()=>{
    if(confirm('Limpar tudo?')){ 
      localStorage.setItem(LS_KEY, JSON.stringify([])); 
      render(); 
    }
  });

  btnFilter.addEventListener('click', ()=>{
    if(pop.style.display==='block'){ 
      pop.style.display='none'; 
      return; 
    }
    buildFilterPills(); 
    positionPop(); 
    pop.style.display='block';
    const close=(e)=>{
      if(!pop.contains(e.target) && e.target!==btnFilter){
        pop.style.display='none'; 
        document.removeEventListener('click', close);
      }
    };
    setTimeout(()=> document.addEventListener('click', close),0);
  });

  window.addEventListener('resize', ()=>{ 
    if(pop.style.display==='block') positionPop(); 
  });
  window.addEventListener('scroll', ()=>{ 
    if(pop.style.display==='block') positionPop(); 
  });

  render();
})();
