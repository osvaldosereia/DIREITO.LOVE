(function(){
  const LS_KEY = 'chatBooyArchive';
  function load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || []; }catch(e){ return []; } }
  function save(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }
  function groupByTheme(items){
    const map = new Map();
    items.forEach(it=>{
      const key = it.theme || '(sem tema)';
      if(!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    return Array.from(map.entries()).map(([theme, list])=>({theme, list}));
  }
  function fmtDate(iso){
    try{ const d = new Date(iso); return d.toLocaleString(); }catch(e){ return iso; }
  }
  function esc(s){ return (s||'').replace(/[&<>]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c])); }

  const root = document.getElementById('archive-root');
  const empty = document.getElementById('empty');
  const search = document.getElementById('search');

  function render(){
    const q = (search.value || '').toLowerCase();
    const data = load();
    const filtered = q ? data.filter(r=> (r.theme||'').toLowerCase().includes(q) || (r.strategyLabel||r.strategy||'').toLowerCase().includes(q) || (r.prompt||'').toLowerCase().includes(q)) : data;
    root.innerHTML = '';
    empty.style.display = filtered.length ? 'none' : 'block';
    const groups = groupByTheme(filtered);
    if(!groups.length) return;

    groups.forEach(g=>{
      const group = document.createElement('div');
      group.className = 'group';
      group.innerHTML = `
        <div class="group-h">
          <h3>${esc(g.theme)} <span class="small">(${g.list.length})</span></h3>
          <div class="small">Clique em Reabrir para voltar ao chat com este prompt</div>
        </div>
        <div class="items"></div>
      `;
      const items = group.querySelector('.items');

      g.list.forEach(rec=>{
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="meta">
            <span class="tag"><img src="icons/file.svg" alt="" style="width:14px;height:14px"> ${esc(rec.strategyLabel || rec.strategy)}</span>
            <span class="tag">${fmtDate(rec.createdAt)}</span>
            ${rec.aiClicks && rec.aiClicks.length ? `<span class="tag">${rec.aiClicks.length} clique(s) IA</span>`:''}
          </div>
          <div class="small">${esc(rec.prompt).slice(0,180)}${rec.prompt.length>180?'…':''}</div>
          <div class="actions">
            <button class="btn badge copy"><img src="icons/copy.svg" style="width:14px;height:14px"> Copiar</button>
            <button class="btn badge open-ai" data-ai="chatgpt"><img src="icons/chatgpt.svg" style="width:14px;height:14px"> ChatGPT</button>
            <button class="btn badge open-ai" data-ai="gemini"><img src="icons/gemini.svg" style="width:14px;height:14px"> Gemini</button>
            <button class="btn badge open-ai" data-ai="perplexity"><img src="icons/perplexity.svg" style="width:14px;height:14px"> Perplexity</button>
            <button class="btn badge reopen"><img src="icons/external.svg" style="width:14px;height:14px"> Reabrir no chat</button>
            <button class="btn badge del" style="margin-left:auto"><img src="icons/trash.svg" style="width:14px;height:14px"> Excluir</button>
          </div>
        `;
        // actions
        card.querySelector('.copy').addEventListener('click', async ()=>{
          await navigator.clipboard.writeText(rec.prompt);
          alert('Copiado!');
        });
        card.querySelectorAll('.open-ai').forEach(btn=>{
          btn.addEventListener('click', ()=>{
            const ai = btn.getAttribute('data-ai');
            const map = {
              chatgpt: 'https://chat.openai.com/',
              gemini: 'https://gemini.google.com/',
              perplexity: 'https://www.perplexity.ai/'
            };
            const url = map[ai];
            if(url) window.open(url, '_blank','noopener');
            // log click
            const data = load();
            const i = data.findIndex(x=>x.id===rec.id);
            if(i>=0){
              data[i].aiClicks = data[i].aiClicks || [];
              data[i].aiClicks.push({ ai, at: new Date().toISOString() });
              save(data);
              render();
            }
          });
        });
        card.querySelector('.reopen').addEventListener('click', ()=>{
          localStorage.setItem('chatBooyReopen', JSON.stringify({ theme: rec.theme, strategy: rec.strategy }));
          window.location.href = 'index.html';
        });
        card.querySelector('.del').addEventListener('click', ()=>{
          if(confirm('Excluir este registro?')){
            const data = load().filter(x=> x.id !== rec.id);
            save(data);
            render();
          }
        });
        items.appendChild(card);
      });

      root.appendChild(group);
    });
  }

  // toolbar
  document.getElementById('btn-clear').addEventListener('click', ()=>{
    if(confirm('Limpar todo o arquivo? Essa ação não pode ser desfeita.')){
      save([]); render();
    }
  });
  document.getElementById('btn-export').addEventListener('click', ()=>{
    const data = load();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chat-booy-arquivo.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('import-file').addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const imported = JSON.parse(reader.result);
        if(!Array.isArray(imported)) throw new Error('Formato inválido');
        // merge (dedup by id)
        const current = load();
        const map = new Map(current.map(x=>[x.id,x]));
        imported.forEach(x=> map.set(x.id, x));
        const merged = Array.from(map.values()).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
        save(merged);
        render();
        alert('Importado com sucesso!');
      }catch(err){ alert('Falha ao importar: '+err.message); }
    };
    reader.readAsText(file);
  });
  search.addEventListener('input', render);

  // init
  render();
})();
