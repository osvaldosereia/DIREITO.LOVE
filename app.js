const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatContainer = document.getElementById("chat-container");
const errorMessage = document.getElementById("error-message");

function addMessage(text, sender = "user") {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

const prompts = {
  explicacao: `
📖 **Explicação Detalhada**

---
Explique o tema de forma clara, organizada e didática, com subtítulos e exemplos práticos.  
Inclua:

1. Conceito fundamental  
2. Contexto histórico e legal  
3. Principais aplicações  
4. Exemplos concretos  
5. Conclusão resumida  

---
💚 <a href="https://direito.love" target="_blank">direito.love</a>
`,
  questoes: `
📝 **Questões Objetivas**

---
Crie **10 questões de múltipla escolha** sobre o tema.  
Formato:  
- Pergunta clara  
- 4 alternativas (A, B, C, D)  
- Apenas 1 correta  
- Ao final, gabarito comentado  

---
💚 <a href="https://direito.love" target="_blank">direito.love</a>
`,
  revisao: `
⏱️ **Revisão Rápida**

---
Monte um **resumão em tópicos** com:  
- Palavras-chave  
- Definições rápidas  
- 3 exemplos de aplicação  
- 3 pegadinhas comuns  

Ideal para leitura em menos de 5 minutos.  

---
💚 <a href="https://direito.love" target="_blank">direito.love</a>
`,
  pegadinhas: `
⚠️ **Pegadinhas de Prova**

---
Liste **5 pegadinhas clássicas** sobre o tema, explicando:  
- Onde o aluno pode errar  
- Como evitar a confusão  
- Exemplos de questões que exploram isso  

---
💚 <a href="https://direito.love" target="_blank">direito.love</a>
`,
  casos: `
⚖️ **Casos Concretos**

---
Crie **3 casos práticos** relacionados ao tema.  
Cada caso deve conter:  
1. Situação hipotética  
2. Questão-problema  
3. Resposta fundamentada em lei/jurisprudência  

---
💚 <a href="https://direito.love" target="_blank">direito.love</a>
`
};

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();

  if (!text) {
    errorMessage.textContent = "⚠️ Por favor, escreva um tema antes de continuar.";
    chatInput.classList.add("input-error");
    return;
  }

  errorMessage.textContent = "";
  chatInput.classList.remove("input-error");

  addMessage(text, "user");
  chatInput.value = "";

  setTimeout(() => {
    const options = `
Escolha uma opção de estudo:<br><br>
<button class="option-btn" data-type="explicacao">Explicação Detalhada</button>
<button class="option-btn" data-type="questoes">Questões Objetivas</button>
<button class="option-btn" data-type="revisao">Revisão Rápida</button>
<button class="option-btn" data-type="pegadinhas">Pegadinhas de Prova</button>
<button class="option-btn" data-type="casos">Casos Concretos</button>
    `;
    const msg = document.createElement("div");
    msg.classList.add("message", "bot");
    msg.innerHTML = `<p>${options}</p>`;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    msg.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        addMessage(prompts[type], "bot");
      });
    });
  }, 500);
});
