// Elementos principais
const entradaContainer = document.getElementById('entrada-container');
const objetivosContainer = document.getElementById('objetivos-container');
const resultadoContainer = document.getElementById('resultado-container');
const resultado = document.getElementById('resultado');
const toast = document.getElementById('toast');

let categoriaAtiva = 'Tema';
let entradaUsuario = '';
let objetivos = {};
let base = {};

// Categoria
document.querySelectorAll('.categoria-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    categoriaAtiva = btn.dataset.categoria;
    renderEntrada();
    renderObjetivos();
  });
});

// Entrada dinâmica
function renderEntrada() {
  entradaContainer.innerHTML = '';
  const wrapper = document.createElement('div');

  if (categoriaAtiva === 'Texto') {
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Cole aqui o conteúdo jurídico...';
    textarea.addEventListener('input', e => entradaUsuario = e.target.value);
    wrapper.appendChild(textarea);

  } else if (categoriaAtiva === 'YouTube') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Cole o link do vídeo...';
    input.addEventListener('input', e => entradaUsuario = e.target.value);
    wrapper.appendChild(input);

  } else if (categoriaAtiva === 'Arquivo') {
    const aviso = document.createElement('p');
    aviso.textContent = 'Você pode indicar o conteúdo de um arquivo (PDF, DOC etc.) ao gerar o prompt. O app não processa arquivos.';
    wrapper.appendChild(aviso);

  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Digite o tema jurídico...';
    input.addEventListener('input', e => entradaUsuario = e.target.value);
    wrapper.appendChild(input);
  }

  entradaContainer.appendChild(wrapper);
}

// Objetivos dinâmicos
function renderObjetivos() {
  objetivosContainer.innerHTML = '';
  const lista = objetivos[categoriaAtiva];
  if (!lista) return;

  lista.forEach(id => {
    const obj = base[id];
    if (!obj) return;

    const card = document.createElement('div');
    card.className = 'objetivo-card';

    const h3 = document.createElement('h3');
    h3.textContent = obj.titulo;
    card.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = obj.descricao;
    card.appendChild(p);

    const btn = document.createElement('button');
    btn.textContent = 'Gerar Prompt';
    btn.addEventListener('click', () => gerarPrompt(obj.prompt));
    card.appendChild(btn);

    objetivosContainer.appendChild(card);
  });
}

// Geração de prompt
function gerarPrompt(template) {
  if (!entradaUsuario || entradaUsuario.trim() === '') {
    mostrarToast('Por favor, preencha o campo de entrada.');
    return;
  }

  const prompt = template.replace('{{entrada}}', entradaUsuario.trim());
  resultado.textContent = prompt;
  resultadoContainer.classList.remove('oculto');

  document.getElementById('copiar-btn').onclick = () => {
    navigator.clipboard.writeText(prompt).then(() => mostrarToast('Prompt copiado com sucesso!'));
  };

  document.getElementById('abrir-btn').onclick = () => {
    const url = `https://chat.openai.com/chat?prompt=${encodeURIComponent(prompt)}`;
    window.open(url, '_blank');
  };
}

// Toast
function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add('visivel');
  setTimeout(() => toast.classList.remove('visivel'), 3000);
}

// Botão topo
document.getElementById('topo-btn').onclick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Inicialização
async function init() {
  const res1 = await fetch('prompts.json');
  const res2 = await fetch('prompts-base.json');
  objetivos = await res1.json();
  base = await res2.json();
  renderEntrada();
  renderObjetivos();
}

init();
