/*
recents.js
Lida com os prompts salvos localmente no navegador (máximo de 50).
Usado por index.html e recents.html.
*/

// Salva um novo prompt no topo da lista
function salvarPrompt(texto) {
  const max = 50;
  let lista = JSON.parse(localStorage.getItem('recentes') || '[]');
  lista.unshift({ texto }); // adiciona no topo
  lista = lista.slice(0, max); // limita a 50
  localStorage.setItem('recentes', JSON.stringify(lista));
}

// Retorna a lista de prompts salvos
function carregarRecentes() {
  return JSON.parse(localStorage.getItem('recentes') || '[]');
}

// Apaga todos os prompts salvos
function limparRecentes() {
  localStorage.removeItem('recentes');
}
