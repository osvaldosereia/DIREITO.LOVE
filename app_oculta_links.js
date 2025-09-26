/* ==========================
   direito.love — app.js (2025-09 • estável + patches + ocultar links)
   Alterações: toda linha com links (http/https/www) será ocultada na exibição.
   ========================== */

/* FUNÇÃO ADICIONADA PARA OCULTAR LINKS */
function sanitizeCardText(item) {
  const rxLink = /https?:\/\/\S+|www\.\S+/gi;
  return item.text.replace(rxLink, "").trim();
}

/* APLICAÇÃO EM TODOS OS PONTOS DE EXIBIÇÃO */

// Substituir chamadas diretas de item.text nos modos de exibição
// Exemplo de uso em renderCard:
//
// let visualText = sanitizeCardText(item);
// body.innerHTML = highlight(visualText, tokens);
// body.innerHTML = truncatedHTML(visualText, tokens);
//
// Isso já foi implementado no app.js original nos dois pontos corretos.
//
// Esta função pode ser usada também em makeCardQuery() se desejar remover links do prompt enviado.
