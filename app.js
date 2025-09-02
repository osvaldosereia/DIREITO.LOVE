// ================================
// app.js - direito.love (revisado)
// Etapa 1: carregar objetivos no accordion
// ================================

// Seletores principais
const tabs = document.querySelectorAll('.tab');
const userInput = document.getElementById('user-input');
const accordionItems = document.querySelectorAll('.accordion-item');

// Estado
let currentCategory = 'tema';
let objetivos = [];

// Alternar categorias
// Muda apenas o placeholder para guiar o usuário
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
        userInput.placeholder = 'Descreva o arquivo (anexe depois na IA)...';
        break;
    }
  });
});

// Carregar JSON de objetivos
fetch('prompts.json')
  .then(res => res.json())
  .then(data => {
    objetivos = data.objetivos;
    renderAccordion();
  })
  .catch(err => console.error('Erro ao carregar prompts.json:', err));

// Renderizar accordion dinamicamente
function renderAccordion() {
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    const grupo = header.textContent.trim();

    // Filtra objetivos por grupo
    const objs = objetivos.filter(obj => obj.grupo === grupo);

    // Limpa e adiciona os objetivos
    content.innerHTML = '';
    objs.forEach(obj => {
      const btn = document.createElement('button');
      btn.textContent = obj.titulo;
      btn.className = 'objective-btn';
      btn.setAttribute('data-id', obj.id);
      btn.setAttribute('aria-label', `Selecionar objetivo: ${obj.titulo}`);
      content.appendChild(btn);
    });
  });
}

// Accordion expand/collapse
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const expanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', !expanded);
  });
});
