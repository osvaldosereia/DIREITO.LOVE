/*
app.js
Lógica base do direito.love (MVP 0)
Gerencia entrada de tema, acessórios fixos e geração do prompt.
*/

const formInput = document.getElementById('input-form');
const temaInput = document.getElementById('tema-input');
const chatArea = document.getElementById('chat-area');

const acessoriosSection = document.getElementById('acessorios-section');
const acessoriosForm = document.getElementById('acessorios-form');
const gerarBtn = document.getElementById('gerar-btn');

const resultadoSection = document.getElementById('resultado-section');
const promptPre = document.getElementById('prompt-gerado');
const copiarBtn = document.getElementById('copiar-btn');
const novoBtn = document.getElementById('novo-btn');

// Estado do app
let temaAtual = '';
let acessoriosSelecionados = [];

// Submeter tema
formInput.addEventListener('submit', (e) => {
  e.preventDefault();
  const tema = temaInput.value.trim();
  if (!tema) return;

  temaAtual = tema;
  temaInput.value = '';
  formInput.classList.add('hidden');

  mostrarMensagem(`🧠 Pensando sobre "${tema}"...`);

  setTimeout(() => {
    mostrarMensagem(`🔧 Selecione como deseja enriquecer seu prompt sobre "${tema}".`);
    renderizarAcessorios();
  }, 1500);
});

// Renderiza os acessórios fixos (Etapa A)
function renderizarAcessorios() {
  acessoriosForm.innerHTML = '';

  acessoriosFixos.forEach((item, index) => {
    const id = `acessorio-${index}`;
    const label = document.createElement('label');
    label.htmlFor = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.value = item;
    checkbox.addEventListener('change', atualizarSelecao);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(item));
    acessoriosForm.appendChild(label);
  });

  acessoriosSection.classList.remove('hidden');
}

// Habilita botão se ≥1 acessório for marcado
function atualizarSelecao() {
  const selecionados = [...acessoriosForm.querySelectorAll('input:checked')];
  acessoriosSelecionados = selecionados.map(input => input.value);
  gerarBtn.disabled = acessoriosSelecionados.length === 0;
}

// Gerar prompt
gerarBtn.addEventListener('click', () => {
  acessoriosSection.classList.add('hidden');
  mostrarMensagem('🧠 Gerando prompt...');

  setTimeout(() => {
    const prompt = `Tema: ${temaAtual}\n\nIncluir: ${acessoriosSelecionados.join(', ')}`;
    mostrarMensagem('📝 Pronto! Aqui está seu prompt:');
    promptPre.textContent = prompt;
    resultadoSection.classList.remove('hidden');
  }, 1500);
});

// Copiar prompt
copiarBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(promptPre.textContent).then(() => {
    copiarBtn.textContent = '✅ Copiado!';
    setTimeout(() => {
      copiarBtn.textContent = '📋 Copiar';
    }, 1500);
  });
});

// Novo prompt
novoBtn.addEventListener('click', () => {
  resultadoSection.classList.add('hidden');
  temaAtual = '';
  acessoriosSelecionados = [];
  formInput.classList.remove('hidden');
  temaInput.focus();
  mostrarMensagem('📢 Digite outro tema para gerar um novo prompt.');
});

// Adiciona mensagens ao chat
function mostrarMensagem(texto) {
  const div = document.createElement('div');
  div.className = 'mensagem-recepcao';
  div.textContent = texto;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}
