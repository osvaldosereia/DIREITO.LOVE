// ================================
// app.js - direito.love
// Lógica base: categorias, accordion, modal, drawer
// ================================

// Seletores principais
const tabs = document.querySelectorAll('.tab');
const userInput = document.getElementById('user-input');
const accordionHeaders = document.querySelectorAll('.accordion-header');
const modal = document.getElementById('prompt-modal');
const modalText = document.getElementById('prompt-text');
const copyBtn = document.getElementById('copy-btn');
const newGoalBtn = document.getElementById('new-goal-btn');
const newInputBtn = document.getElementById('new-input-btn');
const favBtn = document.getElementById('fav-btn');
const waBtn = document.getElementById('wa-btn');
const drawer = document.getElementById('drawer');
const openDrawerBtn = document.getElementById('open-drawer');
const closeDrawerBtn = document.getElementById('close-drawer');

// Estado
let currentCategory = 'tema';
let currentPrompt = '';

// Alternar categorias
// Apenas muda o placeholder para guiar o usuário
// (A lógica de prompts será expandida depois com JSON)
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    currentCategory = tab.dataset.category;
    switch (currentCategory) {
      case 'tema':
        userInput.placeholder = 'Digite o tema do estudo...';
        break;
      case 'texto':
        userInput.placeholder = 'Cole aqui o texto base...';
        break;
      case 'youtube':
        userInput.placeholder = 'Cole o link do vídeo do YouTube...';
        break;
      case 'arquivo':
        userInput.placeholder = 'Indique o arquivo (anexe depois na IA)...';
        break;
    }
  });
});

// Accordion expand/collapse
accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const expanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', !expanded);
  });
});

// Exibir modal com prompt fake (placeholder)
accordionHeaders.forEach(header => {
  header.addEventListener('dblclick', () => {
    currentPrompt = `Prompt gerado para: ${header.textContent} | Entrada: ${userInput.value}`;
    modalText.textContent = currentPrompt;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  });
});

// Botões do modal
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(currentPrompt).then(() => {
    alert('✅ Prompt copiado com sucesso!');
  });
});

newGoalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

newInputBtn.addEventListener('click', () => {
  userInput.value = '';
  modal.style.display = 'none';
});

favBtn.addEventListener('click', () => {
  let favs = JSON.parse(localStorage.getItem('favoritos')) || [];
  favs.push(currentPrompt);
  localStorage.setItem('favoritos', JSON.stringify(favs));
  alert('⭐ Adicionado aos favoritos!');
});

waBtn.addEventListener('click', () => {
  const url = `https://wa.me/?text=${encodeURIComponent(currentPrompt)}`;
  window.open(url, '_blank');
});

// Fechar modal clicando fora
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
});

// Drawer
openDrawerBtn.addEventListener('click', () => {
  drawer.setAttribute('aria-hidden', 'false');
});

closeDrawerBtn.addEventListener('click', () => {
  drawer.setAttribute('aria-hidden', 'true');
});
