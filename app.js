const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatContainer = document.getElementById("chat-container");
const errorMessage = document.getElementById("error-message");

function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const tema = chatInput.value.trim();

  if (!tema) {
    errorMessage.textContent = "⚠️ Por favor, escreva um tema antes de continuar.";
    return;
  }
  errorMessage.textContent = "";
  addMessage(tema, "user");
  chatInput.value = "";

  setTimeout(() => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message", "bot");
    wrapper.innerHTML = `
      <p>✅ Pronto! Criei 5 prompts de estudo para você.  
      Basta clicar em qualquer botão abaixo para copiar:</p>
      <button class="option-btn">Explicação Detalhada</button>
      <button class="option-btn">Questões Objetivas</button>
      <button class="option-btn">Revisão Rápida</button>
      <button class="option-btn">Pegadinhas de Prova</button>
      <button class="option-btn">Casos Concretos</button>
      <button class="save-btn" data-tema="${tema}">💾 Salvar Tema</button>
    `;
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // salvar tema
    wrapper.querySelector(".save-btn").addEventListener("click", () => {
      let salvos = JSON.parse(localStorage.getItem("temasSalvos")) || [];
      salvos.push({ tema, data: new Date().toISOString() });
      localStorage.setItem("temasSalvos", JSON.stringify(salvos));
      alert("💾 Tema salvo com sucesso! Você pode acessá-lo em Configurações > Temas Salvos.");
    });
  }, 500);
});
