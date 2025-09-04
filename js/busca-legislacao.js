
// busca-legislacao.js — busca opcional de conteúdos locais (JSON)
// Nunca bloqueia a UX; se não houver arquivos, apenas retorna lista vazia.
const KB_PATHS = [
  'kb/codigos/cc-parte-geral.json',
  'kb/sumulas/stj.json',
  'kb/jurisprudencia/tjsp-direito-civil.json',
];

async function fetchJSON(path){
  try{
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(_){
    console.info('[kb] ausente:', path);
    return null;
  }
}

export async function buscarSugestoesTema(tema){
  const results = [];
  await Promise.all(KB_PATHS.map(async (p) => {
    const j = await fetchJSON(p);
    if (!j) return;
    // Heurística simples: pega até 3 itens por fonte que contenham parte do tema
    const t = (tema||'').toLowerCase();
    const items = Array.isArray(j) ? j : (Array.isArray(j.itens) ? j.itens : []);
    items.forEach(it => {
      const txt = String(it.titulo || it.nome || it.sumula || it.artigo || it.texto || '').toLowerCase();
      if (t && txt.includes(t)){
        results.push({ fonte:p, titulo: it.titulo || it.nome || it.sumula || it.artigo || 'Item', resumo: (it.texto || it.resumo || '').slice(0, 160) });
      }
    });
  }));
  // limita total e dedup
  const seen = new Set();
  const final = [];
  for(const r of results){
    const key = r.titulo + '|' + r.fonte;
    if (!seen.has(key)){
      final.push(r); seen.add(key);
    }
    if (final.length >= 6) break;
  }
  return final;
}
