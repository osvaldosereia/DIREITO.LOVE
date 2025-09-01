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
      card.className = 'prompt-card';

      const titulo = document.createElement('h3');
      titulo.className = 'prompt-title';
      titulo.textContent = item.titulo;
      card.appendChild(titulo);

      const estrategia = document.createElement('div');
      estrategia.className = 'small';
      estrategia.textContent = item.estrategia;
      card.appendChild(estrategia);

      const textarea = document.createElement('textarea');
      textarea.value = item.prompt;
      textarea.readOnly = true;
      textarea.className = 'prompt-textarea';
      card.appendChild(textarea);

      const row = document.createElement('div');
      row.className = 'center-row';

      const copiarBtn = document.createElement('button');
      copiarBtn.textContent = 'Copiar';
      copiarBtn.className = 'btn copiar';
      copiarBtn.onclick = () => {
        navigator.clipboard.writeText(item.prompt);
        alert('✅ Copiado com sucesso!');
      };

      const abrirBtn = document.createElement('a');
      abrirBtn.href = `index.html?tema=${encodeURIComponent(item.titulo)}&estrategia=${encodeURIComponent(item.estrategia)}`;
      abrirBtn.className = 'btn';
      abrirBtn.textContent = 'Reabrir';
      abrirBtn.target = '_blank';

      const excluirBtn = document.createElement('button');
      excluirBtn.textContent = 'Excluir';
      excluirBtn.className = 'btn excluir';
      excluirBtn.onclick = () => {
        historico.splice(index, 1);
        localStorage.setItem("historico", JSON.stringify(historico));
        renderHistorico();
      };

      row.appendChild(copiarBtn);
      row.appendChild(abrirBtn);
      row.appendChild(excluirBtn);
      card.appendChild(row);

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
