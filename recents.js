/*
recents.js
Gerencia o armazenamento local de prompts gerados
Limite: 50 entradas
*/

const CHAVE_RECENTES = 'prompts-recentes';
const LIMITE = 50;

// Salva um novo prompt
function salvarPrompt(promptTexto) {
  const recentes = carregarRecentes();
  const novo = {
    id: Date.now(),
    texto: promptTexto.trim()
  };

  // Adiciona no topo
  recentes.unshift(novo);

  // Limita a 50
  if (recentes.length > LIMITE) {
    recentes.pop();
  }

  localStorage.setItem(CHAVE_RECENTES, JSON.stringify(recentes));
}

// Retorna todos os prompts salvos
function carregarRecentes() {
  try {
    const salvos = localStorage.getItem(CHAVE_RECENTES);
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

// Exclui um pelo ID
function excluirPrompt(id) {
  const recentes = carregarRecentes().filter(p => p.id !== id);
  localStorage.setItem(CHAVE_RECENTES, JSON.stringify(recentes));
}

// Limpa tudo
function limparRecentes() {
  localStorage.removeItem(CHAVE_RECENTES);
}
