// /js/busca-legislacao.js

// 1) Caminhos ABSOLUTOS (começando com "/")
const KB_PATHS = [
  '/kb/codigos/cc-parte-geral.json',
  '/kb/sumulas/stj.json',
  '/kb/jurisprudencia/tjsp-direito-civil.json',
];

// Garante que sempre haja "/" no início (failsafe, caso alguém adicione relativo no futuro)
const normalizePath = (p) => p.startsWith('/') ? p : `/${p.replace(/^(\.\/)?/, '')}`;

async function fetchJSON(path) {
  const url = normalizePath(path);
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    console.debug('[kb] ok:', url);
    return data;
  } catch (e) {
    console.info('[kb] ausente/erro:', url, e.message);
    return null;
  }
}

// Flatten genérico para diversos esquemas
function flattenItems(data) {
  const out = [];
  const visit = (x) => {
    if (!x) return;
    if (Array.isArray(x)) { x.forEach(visit); return; }
    if (typeof x === 'object') {
      const titulo = x.titulo || x.nome || x.sumula || x['súmula'] || x.artigo || x.epigrafe || x['epígrafe'];
      const texto  = x.texto  || x.ementa || x.resumo || x.descricao || x['descrição'] || x.conteudo || x['conteúdo'];
      if (titulo || texto) out.push({ titulo: String(titulo || 'Item'), resumo: texto ? String(texto) : '' });

      for (const k of Object.keys(x)) {
        if (['itens','items','lista','artigos','sumulas','súmulas','dados','conteudo','conteúdo','capitulos','capítulos','secoes','seções'].includes(k)) {
          visit(x[k]);
        }
      }
    }
  };
  visit(data);
  return out;
}

// Normalizador simples (acentos → sem acentos, minúsculas)
const norm = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export async function buscarSugestoesTema(tema) {
  const results = [];
  const tokens = norm(tema).split(/\s+/).filter(Boolean);

  for (const p of KB_PATHS) {
    const j = await fetchJSON(p);
    if (!j) continue;

    let items = [];
    if (Array.isArray(j)) items = j;
    else if (Array.isArray(j.itens)) items = j.itens;
    else items = flattenItems(j);

    items.forEach(it => {
      const title = String(it.titulo || it.nome || it.sumula || it['súmula'] || it.artigo || it).trim();
      const text  = String(it.texto  || it.ementa || it.resumo || it.descricao || it['descrição'] || '').trim();
      const hay   = norm(`${title} ${text}`);

      // casa se QUALQUER token aparecer (mais permissivo)
      const match = !tokens.length || tokens.some(t => hay.includes(t));
      if (match) {
        results.push({ fonte: p, titulo: title || 'Item', resumo: (text || '').slice(0, 160) });
      }
    });
  }

  // dedup por (titulo|fonte) + limite 8
  const seen = new Set(); const final = [];
  for (const r of results) {
    const key = r.titulo + '|' + r.fonte;
    if (!seen.has(key)) {
      final.push(r); seen.add(key);
    }
    if (final.length >= 8) break;
  }
  console.debug('[kb] sugestões:', final.length);
  return final;
}
