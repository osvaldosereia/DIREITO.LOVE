document.addEventListener('DOMContentLoaded', () => {
  const archiveRoot = document.getElementById('archive-root');
  const empty = document.getElementById('empty');
  const btnClear = document.getElementById('btn-clear');
  const toast = document.getElementById('toast');

  let historico = JSON.parse(localStorage.getItem("historico")) || [];

  /* =========================
     Toast (feedback moderno)
     ========================= */
  function showToast(msg, type = "info") {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.opacity = "1";
    }, 50);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => (toast.style.display = "none"), 400);
    }, 2500);
  }

  /* =========================
     Render cards do histórico
     ========================= */
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

      // Botão Copiar
      const copiarBtn = document.createElement('button');
      copiarBtn.innerHTML = '📋 Copiar';
      copiarBtn.className = 'btn copiar';
      copiarBtn.onclick = () => {
        navigator.clipboard.writeText(item.prompt)
          .then(() => showToast("✅ Copiado com sucesso!", "success"))
          .catch(() => showToast("⚠️ Falha ao copiar.", "error"));
      };

      // Botão Reabrir
      const abrirBtn = document.createElement('a');
      abrirBtn.href = `index.html?tema=${encodeURIComponent(item.titulo)}&estrategia=${encodeURIComponent(item.estrategia)}`;
      abrirBtn.className = 'btn';
      abrirBtn.textContent = '🔄 Reabrir';
      abrirBtn.target = '_blank';

      // Botão Excluir
      const excluirBtn = document.createElement('button');
      excluirBtn.innerHTML = '🗑 Excluir';
      excluirBtn.className = 'btn excluir';
      excluirBtn.onclick = () => {
        historico.splice(index, 1);
        localStorage.setItem("historico", JSON.stringify(historico));
        renderHistorico();
        showToast("🗑 Item removido.", "info");
      };

      row.append(copiarBtn, abrirBtn, excluirBtn);
      card.appendChild(row);

      archiveRoot.appendChild(card);
    });
  }

  /* =========================
     Limpar tudo
     ========================= */
  btnClear.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
      localStorage.removeItem("historico");
      historico = [];
      renderHistorico();
      showToast("🧹 Histórico limpo.", "info");
    }
  });

  renderHistorico();
});
