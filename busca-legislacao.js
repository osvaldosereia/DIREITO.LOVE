/*
busca-legislacao.js
Etapa B — busca dinâmica de artigos, súmulas e jurisprudências
Base: https://direito.love/
*/

const FONTE_BASE = '.'; // funciona com o mesmo domínio do app
const ARQUIVOS = [
  'codigos/cc-parte-geral.json',
  'sumulas/stj.json',
  'jurisprudencia/tjsp-direito-civil.json'
];

async function buscarAcessoriosDinamicos(tema) {
  const resultados = [];

  for (const path of ARQUIVOS) {
    try {
      const res = await fetch(`${FONTE_BASE}/${path}`);
      const json = await res.json();

      json.forEach(item => {
        const score = calcularScore(tema, item);
        if (score >= 0.35) {
          resultados.push({ ...item, score });
        }
      });
    } catch (err) {
      console.warn(`Erro ao carregar ${path}:`, err);
    }
  }

  resultados.sort((a, b) => b.score - a.score);
  return resultados.slice(0, 8);
}

function calcularScore(tema, item) {
  const palavrasTema = tema.toLowerCase().split(/\s+/);
  const contexto = [...(item.tags || []), ...(item.palavras_chave || [])]
    .join(' ')
    .toLowerCase();

  let score = 0;
  palavrasTema.forEach(palavra => {
    if (contexto.includes(palavra)) score += 1;
  });

  return score / palavrasTema.length;
}

function renderizarEtapaB(itens) {
  const secao = document.getElementById('dinamicos-section');
  const form = document.getElementById('dinamicos-form');
  form.innerHTML = '';

  itens.forEach((item, index) => {
    const id = `dinamico-${index}`;
    const label = document.createElement('label');
    label.htmlFor = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.value = item.titulo;
    checkbox.dataset.tipo = item.tipo;
    checkbox.addEventListener('change', () => {
      const selecionados = form.querySelectorAll('input:checked');
      window._dinamicosSelecionados = Array.from(selecionados).map(i => i.value);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${item.titulo}`));
    form.appendChild(label);
  });

  secao.classList.remove('hidden');
  window._dinamicosSelecionados = [];
}
