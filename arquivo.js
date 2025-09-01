document.addEventListener('DOMContentLoaded', () => {
  const archiveRoot = document.getElementById('archive-root');
  const empty = document.getElementById('empty');
  const btnClear = document.getElementById('btn-clear');

  let historico = JSON.parse(localStorage.getItem("historico")) || [];

  /* ========== Toast ========== */
  function showToast(msg, type = "ok") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = msg;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /* ========== Render ========== */
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
      textarea.setAttribute("aria-label", `Prompt salvo: ${item.titulo}`);
      card.appendChild(textarea);

      const row = document.createElement('div');
      row.className = 'center-row';

      /* Copiar */
      const copiarBtn = document.createElement('button');
      copiarBtn.textContent = '📋 Copiar';
      copiarBtn.className = 'btn copiar';
      copiarBtn.onclick = () => {
        navigator.clipboard.writeText(item.prompt).then(() => {
          showToast("✅ Copiado com sucesso!");
        });
      };

      /* Reabrir */
      const abrirBtn = document.createElement('a');
      abrirBtn.href = `index.html?tema=${encodeURIComponent(item.titulo)}&estrategia=${encodeURIComponent(item.estrategia)}`;
      abrirBtn.className = 'btn';
      abrirBtn.textContent = '🔄 Reabrir';
      abrirBtn.setAttribute("aria-label", `Reabrir prompt de ${item.titulo}`);
      abrirBtn.target = '_blank';

      /* Excluir */
      const excluirBtn = document.createElement('button');
      excluirBtn.textContent = '🗑️ Excluir';
      excluirBtn.className = 'btn excluir';
      excluirBtn.onclick = () => {
        historico.splice(index, 1);
        localStorage.setItem("historico", JSON.stringify(historico));
        renderHistorico();
        showToast("🗑️ Item removido", "warn");
      };

      row.append(copiarBtn, abrirBtn, excluirBtn);
      card.appendChild(row);

      archiveRoot.appendChild(card);
    });
  }

  renderHistorico();

  /* Limpar tudo */
  btnClear.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar todo o histórico?')) {
      localStorage.removeItem("historico");
      historico = [];
      renderHistorico();
      showToast("🧹 Histórico limpo", "warn");
    }
  });
});
