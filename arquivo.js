(function() {
  // Função para carregar os itens do localStorage
  function loadItems() {
    try {
      return JSON.parse(localStorage.getItem('chatBooyArchive')) || [];
    } catch (e) {
      return [];
    }
  }

  // Função para salvar os itens no localStorage
  function saveItems(items) {
    localStorage.setItem('chatBooyArchive', JSON.stringify(items));
  }

  // Função para exibir os itens armazenados
  function renderItems() {
    const items = loadItems();
    const archiveRoot = document.getElementById('archive-root');
    archiveRoot.innerHTML = '';  // Limpa o conteúdo atual
    if (items.length === 0) {
      document.getElementById('empty').style.display = 'block';
      return;
    } else {
      document.getElementById('empty').style.display = 'none';
    }

    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'archive-item';
      itemDiv.innerHTML = `
        <div class="item-content">
          <div class="item-theme">${item.theme}</div>
          <div class="item-strategy">${item.strategy}</div>
          <div class="item-prompt">${item.prompt}</div>
        </div>
        <div class="item-actions">
          <button class="btn-reopen">Reabrir</button>
          <button class="btn-delete">Excluir</button>
        </div>
      `;

      // Ações dos botões
      itemDiv.querySelector('.btn-reopen').addEventListener('click', () => {
        window.location.href = 'index.html';  // Redireciona para o chat
      });

      itemDiv.querySelector('.btn-delete').addEventListener('click', () => {
        const updatedItems = items.filter(i => i.id !== item.id);
        saveItems(updatedItems);
        renderItems();  // Re-renderiza a lista de itens
      });

      archiveRoot.appendChild(itemDiv);
    });
  }

  // Função para filtrar itens
  function filterItems() {
    const filterValue = document.getElementById('filter-input').value.trim().toLowerCase();
    const items = loadItems();
    const filteredItems = items.filter(item => item.theme.toLowerCase().includes(filterValue));
    renderFilteredItems(filteredItems);
  }

  // Função para renderizar os itens filtrados
  function renderFilteredItems(filteredItems) {
    const archiveRoot = document.getElementById('archive-root');
    archiveRoot.innerHTML = '';  // Limpa o conteúdo atual

    if (filteredItems.length === 0) {
      document.getElementById('empty').style.display = 'block';
      return;
    } else {
      document.getElementById('empty').style.display = 'none';
    }

    filteredItems.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'archive-item';
      itemDiv.innerHTML = `
        <div class="item-content">
          <div class="item-theme">${item.theme}</div>
          <div class="item-strategy">${item.strategy}</div>
          <div class="item-prompt">${item.prompt}</div>
        </div>
        <div class="item-actions">
          <button class="btn-reopen">Reabrir</button>
          <button class="btn-delete">Excluir</button>
        </div>
      `;

      // Ações dos botões
      itemDiv.querySelector('.btn-reopen').addEventListener('click', () => {
        window.location.href = 'index.html';  // Redireciona para o chat
      });

      itemDiv.querySelector('.btn-delete').addEventListener('click', () => {
        const updatedItems = filteredItems.filter(i => i.id !== item.id);
        saveItems(updatedItems);
        renderFilteredItems(updatedItems);  // Re-renderiza a lista filtrada
      });

      archiveRoot.appendChild(itemDiv);
    });
  }

  // Inicializa o carregamento e renderiza os itens
  renderItems();

  // Adiciona o evento de filtragem
  document.getElementById('filter-input').addEventListener('input', filterItems);

})();
