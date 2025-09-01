document.addEventListener('DOMContentLoaded', () => {
  const archiveRoot = document.getElementById('archive-root');
  const empty = document.getElementById('empty');
  const btnClear = document.getElementById('btn-clear');

  let historico = JSON.parse(localStorage.getItem("historico")) || [];

  function renderHistorico() {
    archiveRoot.innerHTML = '';
    if (!historico.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';

    historico.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card';

      const titulo = document.createElement('h4');
      titulo.textContent = item.titulo;
      card.appendChild(titulo);

      const estrategia = document.createElement('small');
      estrategia.textContent = item.estrategia;
      estrategia.className = 'muted';
      card.appendChild(estrategia);

      const textarea = document.createElement('textarea');
      textarea.value = item.prompt;
      textarea.readOnly = true;
      textarea.className = 'prompt-textarea';
      card.appendChild(textarea);

      const btnRow = document.createElement('div');
      btnRow.className = 'btn-row';

      const copiarBtn = document.createElement('button');
      copiarBtn.textContent = 'Copiar';
      copiarBtn.className = 'btn copiar';
      copiarBtn.onclick = () => {
        navigator.clipboard.writeText(item.prompt);
        opcoesRow.style.display = 'flex';
      };

      const excluirBtn = document.createElement('button');
      excluirBtn.textContent = 'Excluir';
      excluirBtn.className = 'btn excluir';
      excluirBtn.onclick = () => {
        historico.splice(index, 1);
        localStorage.setItem("historico", JSON.stringify(historico));
        renderHistorico();
      };

      btnRow.appendChild(copiarBtn);
      btnRow.appendChild(excluirBtn);
      card.appendChild(btnRow);

      const opcoesRow = document.createElement('div');
      opcoesRow.className = 'opcoes-row';
      opcoesRow.style.display = 'none';

      const btns = [
        { nome: 'ChatGPT', icone: 'gpt', url: 'https://chat.openai.com/' },
        { nome: 'Gemini', icone: 'gemini', url: 'https://gemini.google.com/' },
        { nome: 'Perplexity', icone: 'perplexity', url: 'https://www.perplexity.ai/' },
        { nome: 'Reabrir', icone: 'reabrir', url: `index.html?tema=${encodeURIComponent(item.titulo)}&estrategia=${encodeURIComponent(item.estrategia)}` }
      ];

      btns.forEach(btn => {
        const el = document.createElement('a');
        el.href = btn.url;
        el.target = '_blank';
        el.className = 'btn mini';
        el.innerHTML = `<img src="icons/${btn.icone}.svg" alt="${btn.nome}" />`;
        el.title = btn.nome;
        opcoesRow.appendChild(el);
      });

      card.appendChild(opcoesRow);
      archiveRoot.appendChild(card);
    });
  }

  renderHistorico();

  btnClear.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar tudo?')) {
      localStorage.removeItem("historico");
      historico = [];
      renderHistorico();
    }
  });
});
