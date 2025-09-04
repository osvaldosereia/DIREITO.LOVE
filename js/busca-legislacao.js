// js/busca-legislacao.js

const KB_PATHS = [
  'kb/codigos/cc-parte-geral.json',
  'kb/sumulas/stj.json',
  'kb/jurisprudencia/tjsp-direito-civil.json',
];

// === Utilitário para carregar JSON com tolerância a falhas ===
async function fetchJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    console.debug('[kb] ok:', path);
    return data;
  } catch (e) {
    console.info('[kb] ausente/erro:', path, e.message);
    return null;
  }
}

// === Flatten genérico para normalizar diversos esquemas ===
function flattenItems(data) {
  const out = [];
  const visit = (x) => {
    if (!x) return;
    if (Array.isArray(x)) {
      x.forEach(visit);
      return;
    }
    if (typeof x === 'object') {
      const titulo = x.titulo || x.nome || x.sumula || x['súmula'] || x.artigo || x.epigrafe || x['epígrafe'];
      const texto  = x.texto || x.ementa || x.resumo || x.descricao || x['descrição'] || x.conteudo || x['conteúdo'];
      if (titulo || texto) {
        out.push({ 
          titulo: String(titulo || 'Item'), 
          resumo: texto ? String(texto) : '' 
        });
      }
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

// === Normalização para remover acentos e deixar minúsculo ===
const norm = (s) => (s || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

// === Função principal exportada ===
export async function buscarSugestoesTema(tema) {
  const results = [];
  const tokens = norm(tema).split(/\s+/).filter(Boolean); // ex.: ["responsabilidade","civil"]

  for (const p of KB_PATHS) {
    const j = await fetchJSON(p);
    if (!j) continue;

    let items = [];
    if (Array.isArray(j)) items = j;
    else if (Array.isArray(j.itens)) items = j.itens;
    else items = flattenItems(j); // já existe no arquivo

    items.forEach(it => {
      const title = String(
        it.titulo || it.nome || it.sumula || it['súmula'] || it.artigo || it
      ).trim();
      const text  = String(
        it.texto || it.ementa || it.resumo || it.descricao || it['descrição'] || ''
      ).trim();
      const hay = norm(`${title} ${text}`);

      // casa se QUALQUER token aparecer (mais permissivo)
      const match = !tokens.length || tokens.some(t => hay.includes(t));
      if (match) {
        results.push({ 
          fonte: p, 
          titulo: title || 'Item', 
          resumo: (text || '').slice(0,160) 
        });
      }
    });
  }

  // dedup + limita
  const seen = new Set();
  const final = [];
  for (const r of results) {
    const key = r.titulo + '|' + r.fonte;
    if (!seen.has(key)) {
      final.push(r);
      seen.add(key);
    }
    if (final.length >= 8) break;
  }
  console.debug('[kb] sugestões:', final.length);
  return final;
}
