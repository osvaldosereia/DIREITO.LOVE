(function() {
  // Log para verificar se o app.js está sendo carregado corretamente
  console.log('app.js carregado');

  // Variáveis globais
  let tema = '';  // Inicializa a variável tema
  let chosen = new Set();  // Inicializa a variável chosen como um Set vazio

  // Função para criar elementos HTML
  function el(tag, cls, html) {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (html != null) x.innerHTML = html;
    return x;
  }

  // Função para adicionar mensagens no chat
  function push(role, nodeOrHtml) {
    const box = document.getElementById('messages');
    const msg = document.createElement('div');
    msg.classList.add('msg', role);
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    if (typeof nodeOrHtml === 'string') {
      bubble.innerHTML = nodeOrHtml;
    } else {
      bubble.appendChild(nodeOrHtml);
    }
    msg.appendChild(bubble);
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  // Adicionando os event listeners para os botões flutuantes

  // Botão "Arquivo"
  document.getElementById('btn-archive').addEventListener('click', () => {
    console.log('Botão Arquivo clicado');
    // Redireciona para a página de arquivo (arquivo.html)
    window.location.href = 'arquivo.html';
  });

  // Botão "Reiniciar"
  document.getElementById('btn-restart').addEventListener('click', () => {
    console.log('Botão Reiniciar clicado');
    // Reinicia o processo de pesquisa
    tema = '';  // Limpa o tema
    chosen.clear();  // Limpa as escolhas anteriores
    showInputBubble('Digite o tema…');  // Exibe o campo de entrada novamente
  });

  // Função para exibir o campo de entrada
  function showInputBubble(placeholder = 'Digite o tema…') {
    const wrap = el('div', 'input-bubble');
    const input = el('input');
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    const row = el('div', 'row');
    const send = el('button', 'iconbtn');
    send.title = 'Enviar';
    send.innerHTML = '<img src="icons/send.svg" alt="" />';
    row.appendChild(send);
    wrap.appendChild(input);
    wrap.appendChild(row);
    const bubble = push('bot', wrap);

    const submit = async () => {
      const text = input.value.trim();
      if (!text) return input.focus();
      tema = text;  // Define o tema como o texto inserido
      bubble.closest('.msg').remove();
      push('user', `<div>${truncate(tema, 140)}</div>`);
      let t = typingStart();
      await wait();
      typingStop(t);
      push('bot', 'Beleza. Vou te mostrar as estratégias disponíveis.');
      await wait(300, 700);
      t = typingStart();
      await wait(300, 700);
      typingStop(t);
      push('bot', `O que você quer fazer com <strong>${truncate(tema, 60)}</strong>?`);
      await wait(200, 500);
      showChips();
    };

    send.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') submit();
    });
    input.focus();
  }

})();
