document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".menu-toggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
    document.getElementById("sidebar-overlay").hidden = false;
  });
  document.getElementById("sidebar-overlay").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.remove("active");
    document.getElementById("sidebar-overlay").hidden = true;
  });
  const newBtn = document.getElementById("new-btn");
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      closeModal();
      askOptions();
    });
  }
  document.getElementById("nav-tema").addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "auto";
    let next = current === "light" ? "dark" : current === "dark" ? "auto" : "light";
    localStorage.setItem("theme", next);
    applyTheme(next);
    showToast("Tema alterado para: " + next);
  });
  function applyTheme(mode) {
    document.body.classList.remove("theme-light", "theme-dark");
    if (mode === "light") document.body.classList.add("theme-light");
    else if (mode === "dark") document.body.classList.add("theme-dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.body.classList.add("theme-dark");
      else document.body.classList.add("theme-light");
    }
  }
  function savePrompt() {
    try {
      const content = document.getElementById("prompt-text").dataset.fullPrompt;
      let prompts = JSON.parse(localStorage.getItem("prompts") || "[]");
      if (prompts.length >= 100) prompts.shift();
      const theme = localStorage.getItem("theme") || "auto";
      prompts.push({ theme, text: content, date: new Date().toISOString() });
      localStorage.setItem("prompts", JSON.stringify(prompts));
      showToast("Prompt salvo com sucesso ⭐");
      if (navigator.vibrate) navigator.vibrate(100);
    } catch (err) { showToast("Erro ao salvar prompt."); }
  }
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show", "pulse");
    setTimeout(() => { toast.classList.remove("show", "pulse"); }, 2500);
  }
  function renderSavedPrompts() {
    const list = document.getElementById("salvos-list");
    list.innerHTML = "";
    const prompts = JSON.parse(localStorage.getItem("prompts") || "[]");
    prompts.forEach(p => {
      const li = document.createElement("li");
      li.innerText = p.theme + " — " + new Date(p.date).toLocaleDateString();
      li.onclick = () => openModal(p.text, p.text);
      list.appendChild(li);
    });
  }
  document.getElementById("nav-salvos").addEventListener("click", () => {
    showPage("salvos-page");
    renderSavedPrompts();
  });
  document.getElementById("nav-sobre").addEventListener("click", () => {
    showPage("sobre-page");
  });
  const savedTheme = localStorage.getItem("theme") || "auto";
  applyTheme(savedTheme);
});