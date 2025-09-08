// limpar_juris.js
const fs = require('fs');
const crypto = require('crypto');

const hash8 = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 8);

// 1) Remove o eco do resumo quando ele reaparece após "INFORMATIVO"
function cleanTexto(t) {
  const parts = t.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 5) {
    const resumo = parts[2];
    const last = parts[parts.length - 1];
    if (resumo === last) parts.pop();
  }
  return parts.join(' | ');
}

// 2) Gera campos úteis pra render
function parseTexto(t) {
  const p = t.split('|').map(s => s.trim()).filter(Boolean);
  return {
    org: p[0] || '',
    data: p[1] || '',
    ref: p[2] || '',
    info: (p.find(x => /^INFORMATIVO\b/i.test(x)) || ''),
    resumo: p.slice(3).filter(x => !/^INFORMATIVO\b/i.test(x)).join(' | ')
  };
}

function processar(inPath, outPath) {
  const raw = JSON.parse(fs.readFileSync(inPath, 'utf8'));

  const seenExact = new Set(); // (id + texto) idênticos
  const byId = new Map();      // checar conflitos de id
  const out = [];

  for (const it of raw) {
    const textoLimpo = cleanTexto(it.texto);
    const keyExact = it.id + '::' + textoLimpo;

    // dedup total
    if (seenExact.has(keyExact)) continue;
    seenExact.add(keyExact);

    // resolver id duplicado com conteúdos diferentes
    let id = it.id;
    if (byId.has(id)) {
      const prev = byId.get(id);
      if (prev !== textoLimpo) id = `${id}__${hash8(textoLimpo)}`;
      else continue; // mesmo id e mesmo texto => já temos
    }
    byId.set(id, textoLimpo);

    out.push({ id, texto: textoLimpo, ...parseTexto(textoLimpo) });
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`OK! ${raw.length} -> ${out.length} itens limpos.`);
}

// Rode: node limpar_juris.js
processar('dados.json', 'dados.limpos.json');
