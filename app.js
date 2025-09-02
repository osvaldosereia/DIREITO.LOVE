const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatContainer = document.getElementById("chat-container");
const errorMessage = document.getElementById("error-message");

// função auxiliar para criar mensagens no chat
function addMessage(text, sender = "user") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = `<p>${text}</p>`;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// enviar mensagem
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();

  if (!text) {
    errorMessage.textContent = "⚠️ Por favor, escreva um tema antes de continuar.";
    chatInput.classList.add("input-error");
    return;
  }

  // limpar erro
  errorMessage.textContent = "";
  chatInput.classList.remove("input-error");

  // exibe mensagem do usuário
  addMessage(text, "user");

  // limpa input
  chatInput.value = "";

  // resposta do app (placeholder)
  setTimeout(() => {
    addMessage("Escolha uma opção: Explicação Detalhada, Questões Objetivas, Revisão Rápida, Pegadinhas de Prova, Casos Concretos", "bot");
  }, 500);
});
