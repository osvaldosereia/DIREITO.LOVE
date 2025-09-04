document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");

  // Arquivos JSON disponíveis
  const fontes = [
    "/data/codigo_penal.json",
    "/data/codigo_civil.json",
    "/data/sumulas_stf.json",
    "/data/sumulas_stj.json",
    "/data/jurisprudencias_stf.json",
    "/data/jurisprudencias_stj.json"
  ];

  // Função para adicionar mensagens no chat
  function addMessage(texto, classe = "bot") {
    const p = document.createElement("p");
    p.className = classe;
    p.textContent = texto;
    messages.appendChild(p);
    messages.scrollTop = messages.scrollHeight;
  }

  // Buscar termo nos JSONs
  async function buscarTema(termo) {
    addMessage("🔎 Buscando por: " + termo + "...");

    let encontrou = false;

    for (let fonte of fontes) {
      try {
        const dados = await fetch(fonte).then(r => r.json());
        const texto = JSON.stringify(dados).toLowerCase();

        if (texto.includes(termo.toLowerCase())) {
          encontrou = true;
          addMessage("📂 Fonte: " + fonte);

          // Mostrar parte do conteúdo encontrado
          const preview = JSON.stringify(dados, null, 2).slice(0, 300) + "...";
          addMessage(preview);
        }
      } catch (e) {
        console.error("Erro ao carregar", fonte, e);
      }
    }

    if (!encontrou) {
      addMessage("❌ Nenhum resultado encontrado para: " + termo);
    }
  }

  // Evento do formulário
  form.addEventListener("submit", e => {
    e.preventDefault();
    const termo = input.value.trim();
    if (!termo) return;
    addMessage("👤 " + termo, "user");
    buscarTema(termo);
    input.value = "";
  });
});
