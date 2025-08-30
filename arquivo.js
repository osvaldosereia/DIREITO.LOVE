(function(){
  const LS_KEY='chatBooyArchive';
  const FILTER_KEY='chatBooyFilter';
  const load = ()=>{ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || []; }catch(e){ return []; } };
  const save = (v)=> localStorage.setItem(LS_KEY, JSON.stringify(v));
  const loadFilter = ()=>{ try{ return JSON.parse(localStorage.getItem(FILTER_KEY)) || []; }catch(e){ return []; } };
  const saveFilter = (v)=> localStorage.setItem(FILTER_KEY, JSON.stringify(v));

  const root = document.getElementById('archive-root');
  const empty = document.getElementById('empty');
  const btnClear = document.getElementById('btn-clear');
  const btnFilter = document.getElementById('btn-filter');
  const pop = document.getElementById('filter-pop');
  const row = document.getElementById('filter-row');

  const esc = (s)=> (s||'').replace(/[&<>]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]));
  const fmt = (iso)=>{ try{ return new Date(iso).toLocaleString(); }catch(e){ return iso; } };
  const groupBy = (arr, keyFn)=> arr.reduce((m,x)=>{ const k=keyFn(x); (m[k]=m[k]||[]).push(x); return m; }, {});

  const LABELS = {
    prova:'Estudar p/ Prova',
    questoes:'Questões (A–E)',
    correlatos:'Correlatos',
    apresentacao:'Apresentação (5min)',
    decoreba:'Decoreba',
    casos:'Casos concretos',
    testeRelampago:'🧪 Teste',
    mapaMental:'🧠 Mapa',
    errosProva:'🎯 Erros',
    quadroComparativo:'📚 Quadro'
  };

  function currentStrategies(data){
    const set = new Set(data.map(x=> x.strategy).filter(Boolean));
    return Array.from(set);
  }

  function buildFilterPills(data){
    const filters = loadFilter(); // array de strategies selecionadas
    row.innerHTML='';
    const list = currentStrategies(data);
    if(!list.length){
      row.innerHTML = '<span class="small">Sem itens para filtrar.</span>';
      return;
    }
    list.forEach(key=>{
      const b = document.createElement('button');
      b.className = 'pill' + (filters.includes(key) ? ' active' : '');
      b.textContent = LABELS[key] || key;
      b.setAttribute('data-key', key);
      b.addEventListener('click', ()=>{
        const f = new Set(loadFilter());
        if(f.has(key)) f.delete(key); else f.add(key);
        const arr = Array.from(f);
        saveFilter(arr);
        render();
        buildFilterPills(load());
      });
      row.appendChild(b);
    });

    // pill "Limpar"
    const clear = document.createElement('button');
    clear.className = 'pill';
    clear.textContent = 'Limpar';
    clear.addEventListener('click', ()=>{ saveFilter([]); render(); buildFilterPills(load()); });
    row.appendChild(clear);
  }

  function applyFilter(items){
    const f = loadFilter();
    if(!f || !f.length) return items;
    return items.filter(x=> f.includes(x.strategy));
  }

  function positionPop(){
    const rect = btnFilter.getBoundingClientRect();
    pop.style.left = (rect.left) + 'px';
    pop.style.top = (rect.bottom + window.scrollY + 8) + 'px';
  }

  function render(){
    const dataAll = load();
    const data = applyFilter(dataAll);
    root.innerHTML='';
    empty.style.display = data.length ? 'none':'block';
    if(!data.length) return;

    const groups = groupBy(data, x=> x.theme || '(sem tema)');
    Object.keys(groups).forEach(theme=>{
      const g = groups[theme];
      const group = document.createElement('div');
      group.className = 'group';
      group.innerHTML = `
        <div class="group-h">
          <h3>${esc(theme)}</h3>
          <div class="meta small">${g.length} item(s)</div>
        </div>
        <div class="items"></div>
      `;
      const items = group.querySelector('.items');

      g.forEach(rec=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="meta">
            <span class="tag">${esc(LABELS[rec.strategy] || rec.strategy)}</span>
            <span class="tag">${fmt(rec.createdAt)}</span>
          </div>
          <div class="actions">
            <button class="iconbtn copy" title="Copiar prompt" aria-label="Copiar"><img src="icons/copy.svg" alt=""></button>
            <button class="iconbtn open" data-ai="chatgpt" title="Abrir no ChatGPT" aria-label="ChatGPT"><img src="icons/chatgpt.svg" alt=""></button>
            <button class="iconbtn open" data-ai="gemini" title="Abrir no Gemini" aria-label="Gemini"><img src="icons/gemini.svg" alt=""></button>
            <button class="iconbtn open" data-ai="perplexity" title="Abrir no Perplexity" aria-label="Perplexity"><img src="icons/perplexity.svg" alt=""></button>
            <button class="iconbtn reopen" title="Reabrir no chat" aria-label="Reabrir no chat"><img src="icons/send.svg" alt=""></button>
            <button class="iconbtn del" title="Excluir" aria-label="Excluir" style="margin-left:auto"><img src="icons/trash.svg" alt=""></button>
          </div>
        `;

        card.querySelector('.copy').addEventListener('click', async ()=>{
          await navigator.clipboard.writeText(rec.prompt);
          alert('Copiado!');
        });
        card.querySelectorAll('.open').forEach(b=>{
          b.addEventListener('click', ()=>{
            const ai = b.getAttribute('data-ai');
            const map={chatgpt:'https://chat.openai.com/', gemini:'https://gemini.google.com/', perplexity:'https://www.perplexity.ai/'};
            const url=map[ai]; if(url) window.open(url,'_blank','noopener');
          });
        });
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
        items.appendChild(card);
      });

      root.appendChild(group);
    });
  }

  // Events topo
  btnClear.addEventListener('click', ()=>{
    if(confirm('Limpar todo o arquivo?')){
      localStorage.setItem(LS_KEY, JSON.stringify([]));
      render();
    }
  });

  btnFilter.addEventListener('click', ()=>{
    if(pop.style.display === 'none' || !pop.style.display){
      buildFilterPills(load());
      positionPop();
      pop.style.display='block';
      // fechar ao clicar fora
      const onDoc = (e)=>{
        if(!pop.contains(e.target) && e.target !== btnFilter){
          pop.style.display='none';
          document.removeEventListener('click', onDoc);
        }
      };
      setTimeout(()=> document.addEventListener('click', onDoc), 0);
    } else {
      pop.style.display='none';
    }
  });
  window.addEventListener('resize', ()=>{ if(pop.style.display==='block') positionPop(); });
  window.addEventListener('scroll', ()=>{ if(pop.style.display==='block') positionPop(); });

  render();
})();
