
/* ==========================
   direito.love — ui_buckets_patch.js
   Adiciona categorias na UI e sobrescreve renderLazyResults/renderBlock
   (Inclua ESTE arquivo após o app.js original)
   ========================== */

(function(){
  if (typeof window === "undefined") return;

  // ===== Categorização só de UI (por caminho da URL) =====
  const UI_BUCKETS = {
    "Códigos e Leis": {
      "Códigos":    ["data/codigos/", "data/CF88/"],
      "Leis":       ["data/leis/"],
      "Estatutos":  ["data/estatutos/"]
    },
    "Jurisprudencial": {
      "Súmulas":    ["data/sumulas/"],
      "Enunciados": ["data/enunciados/"],
      "Teses":      ["data/teses/"],
      "Julgados":   ["data/julgados/"]
    },
    "Temas": {
      "Notícias":   ["data/noticias/"],
      "Artigos":    ["data/artigos/"],
      "Vídeos":     ["data/videos/"]
    }
  };
  window.UI_BUCKETS = UI_BUCKETS;

  function resolveBucket(url = "", label = "") {
    const u = String(url).toLowerCase();
    for (const [main, subs] of Object.entries(UI_BUCKETS)) {
      for (const [sub, paths] of Object.entries(subs)) {
        if (paths.some(p => u.includes(p))) return { main, sub };
      }
    }
    return { main: "Outros", sub: "Diversos" };
  }
  window.resolveBucket = resolveBucket;

  function renderBucket(mainTitle, subMapElts /* {subTitle: [HTMLElement,...]} */) {
    const bucket = document.createElement("section");
    bucket.className = "bucket";

    const head = document.createElement("button");
    head.className = "bucket-head";
    head.setAttribute("aria-expanded", "true");
    head.innerHTML = `<span class="bucket-title">${mainTitle}</span><span class="bucket-caret" aria-hidden="true">▾</span>`;
    bucket.appendChild(head);

    const body = document.createElement("div");
    body.className = "bucket-body";
    body.hidden = false;

    for (const [subTitle, nodes] of Object.entries(subMapElts)) {
      if (!nodes.length) continue;
      const sub = document.createElement("section");
      sub.className = "subcat";

      const st = document.createElement("div");
      st.className = "subcat-title";
      st.textContent = subTitle;
      sub.appendChild(st);

      nodes.forEach(n => sub.appendChild(n));
      body.appendChild(sub);
    }

    bucket.appendChild(body);

    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", open ? "false" : "true");
      body.hidden = open;
    });

    return bucket;
  }
  window.renderBucket = renderBucket;

  // ===== Usa helpers do app.js original via window =====
  const { els, parseFile, norm, stripThousandDots, hasAllWordTokens, matchesNumbers, KW_RX, detectQueryMode, renderCard } = window;

  // ---- LAZY group section (preview 1 card; carrega o resto ao abrir)
  function renderLazyGroupSection(entry, tokens, term) {
    const { label, url, items, partial } = entry;

    const sec = document.createElement("section");
    sec.className = "group";

    const head = document.createElement("button");
    head.className = "group-head";
    head.setAttribute("aria-expanded", "false");
    head.innerHTML = `
      <span class="group-title">${label}</span>
      <span class="group-caret" aria-hidden="true">▾</span>
    `;
    sec.appendChild(head);

    const body = document.createElement("div");
    body.className = "group-body";
    body.hidden = true;
    body.appendChild(renderCard(items[0], tokens));
    sec.appendChild(body);

    const foot = document.createElement("div");
    foot.className = "group-foot";
    foot.hidden = true;
    const info = document.createElement("small");
    info.textContent = partial ? "Prévia: 1 resultado" : `Exibindo ${items.length}`;
    foot.appendChild(info);
    sec.appendChild(foot);

    let loadedAll = !partial;
    head.addEventListener("click", async () => {
      const open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", open ? "false" : "true");
      body.hidden = open;
      foot.hidden = open;

      if (!open && !loadedAll) {
        const sk = document.createElement("div");
        sk.className = "skel block";
        sk.style.margin = "10px 12px";
        body.appendChild(sk);

        try {
          const fullItems = await parseFile(url, label);
          const words = tokens.filter(t => !/^\d{1,4}$/.test(t));
          const nums  = tokens.filter(t =>  /^\d{1,4}$/.test(t));
          const matches = [];
          for (const it of fullItems) {
            const bag = it._bag || norm(stripThousandDots(it.text));
            const okWords = hasAllWordTokens(bag, words);
            const okNums  = matchesNumbers(it, nums, KW_RX.test(norm(term)), detectQueryMode(norm(term)));
            if (okWords && okNums) matches.push(it);
          }
          loadedAll = true;
          body.innerHTML = "";
          matches.forEach((it) => body.appendChild(renderCard(it, tokens)));

          info.textContent = `Exibindo ${matches.length}`;
          const count = document.createElement("span");
          count.className = "group-count";
          count.textContent = matches.length;
          head.insertBefore(count, head.querySelector(".group-caret"));
        } catch (e) {
          console.warn(e);
          if (window.toast) toast("Falha ao carregar o grupo.");
        }
      }
    });

    return sec;
  }
  window.renderLazyGroupSection = renderLazyGroupSection;

  // ===== Override: renderLazyResults com buckets =====
  window.renderLazyResults = function renderLazyResults(term, groups, tokens) {
    els.stack.innerHTML = "";

    const block = document.createElement("section");
    block.className = "block";

    const title = document.createElement("div");
    title.className = "block-title";
    title.textContent = `Busca: ‘${term}’`;
    block.appendChild(title);

    const buckets = new Map(); // main => Map(sub => entries[])
    const ordered = [...groups].sort((a,b)=> a.label.localeCompare(b.label));

    ordered.forEach((entry) => {
      const { main, sub } = resolveBucket(entry.url, entry.label);
      if (!buckets.has(main)) buckets.set(main, new Map());
      const subMap = buckets.get(main);
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(entry);
    });

    for (const [main, subMap] of buckets.entries()) {
      const subMapElts = {};
      for (const [sub, entries] of subMap.entries()) {
        const nodes = entries.map(e => renderLazyGroupSection(e, tokens, term));
        subMapElts[sub] = nodes;
      }
      block.appendChild(renderBucket(main, subMapElts));
    }

    els.stack.append(block);
  };

  // ===== Override: renderBlock com buckets (fluxos não-lazy) =====
  window.renderBlock = function renderBlock(term, items, tokens) {
    const block = document.createElement("section");
    block.className = "block";

    const title = document.createElement("div");
    title.className = "block-title";
    title.textContent = `Busca: ‘${term}’ (${items.length} resultados)`;
    block.appendChild(title);

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "block-empty";
      empty.textContent = `Nada por aqui com ‘${term}’. Tente outra palavra.`;
      block.appendChild(empty);
      els.stack.append(block);
      return;
    }

    const groupsMap = new Map(); // key -> {label,url,items}
    for (const it of items) {
      const key = `${it.source}::${it.fileUrl}`;
      if (!groupsMap.has(key)) groupsMap.set(key, { label: it.source || "Outros", url: it.fileUrl, items: [] });
      groupsMap.get(key).items.push(it);
    }

    const buckets = new Map(); // main => Map(sub => [groupObjs])
    for (const g of groupsMap.values()) {
      const { main, sub } = resolveBucket(g.url, g.label);
      if (!buckets.has(main)) buckets.set(main, new Map());
      const subMap = buckets.get(main);
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(g);
    }

    for (const [main, subMap] of buckets.entries()) {
      const subMapElts = {};
      for (const [sub, arr] of subMap.entries()) {
        const nodes = arr.sort((a,b)=> a.label.localeCompare(b.label)).map(({label, items}) => {
          const sec = document.createElement("section");
          sec.className = "group";
          const head = document.createElement("button");
          head.className = "group-head";
          head.setAttribute("aria-expanded","false");
          head.innerHTML = `<span class="group-title">${label}</span><span class="group-count">${items.length}</span><span class="group-caret" aria-hidden="true">▾</span>`;
          sec.appendChild(head);
          const body = document.createElement("div");
          body.className = "group-body";
          body.hidden = true;
          items.forEach((it)=> body.appendChild(renderCard(it, tokens)));
          sec.appendChild(body);
          head.addEventListener("click", ()=>{
            const open = head.getAttribute("aria-expanded")==="true";
            head.setAttribute("aria-expanded", open ? "false" : "true");
            body.hidden = open;
          });
          return sec;
        });
        subMapElts[sub] = nodes;
      }
      block.appendChild(renderBucket(main, subMapElts));
    }

    els.stack.append(block);
  };

})();
