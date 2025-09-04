<!--
recentes.html
Lista os últimos prompts gerados pelo usuário (limitado a 50)
-->

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" href="icons/pwa-192.png" />
  <link rel="apple-touch-icon" href="icons/pwa-180.png" />
  <title>📋 Recentes - direito.love</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <!-- Topo fixo -->
  <header class="topbar">
    <div class="logo">💚 direito.love</div>
    <span>📋 Recentes</span>
  </header>

  <main class="chat-area" id="recentes-area">
    <div id="listaRecentes"></div>
  </main>

  <div class="bloco-gerar">
    <button id="voltarBtn">⬅️ Voltar ao início</button>
    <button id="limparBtn">🗑️ Limpar todos</button>
  </div>

  <script src="recents.js"></script>
  <script>
    const lista = document.getElementById('listaRecentes');
    const voltarBtn = document.getElementById('voltarBtn');
    const limparBtn = document.getElementById('limparBtn');

    function renderizarLista() {
      const recentes = carregarRecentes();
      lista.innerHTML = '';

      if (recentes.length === 0) {
        lista.innerHTML = '<div class="mensagem-recepcao">Nenhum prompt salvo ainda.</div>';
        return;
      }

      recentes.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mensagem-recepcao';
        card.innerHTML = `
          <pre>${item.texto}</pre>
          <button onclick="navigator.clipboard.writeText(\`${item.texto}\`)">📋 Copiar</button>
        `;
        lista.appendChild(card);
      });
    }

    voltarBtn.onclick = () => window.location.href = 'index.html';
    limparBtn.onclick = () => {
      if (confirm('Tem certeza que deseja apagar todos os prompts salvos?')) {
        limparRecentes();
        renderizarLista();
      }
    };

    renderizarLista();
  </script>

</body>
</html>
