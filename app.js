/*
app.js
Lógica principal do app direito.love
*/

const formInput = document.getElementById('input-form');
const temaInput = document.getElementById('tema-input');
const chatArea = document.getElementById('chat-area');
const acessoriosSection = document.getElementById('acessorios-section');
const acessoriosForm = document.getElementById('acessorios-form');
const gerarBtn = document.getElementById('gerar-btn');
const gerarBloco = document.querySelector('.bloco-gerar');
const resultadoSection = document.getElementById('resultado-section');
const promptPre = document.getElementById('prompt-gerado');
const copiarBtn = document.getElementById('copiar-btn');
const novoBtn = document.getElementById('novo-btn');
const dinamicosSection = document.getElementById('dinamicos-section');
const dinamicosForm = document.getElementById('dinamicos-form');

let temaAtual = '';
let acessoriosSelecionados = [];

formInput.addEventListener('submit', (e) => {
  e.preventDefault();
  const tema = temaInput.value.trim();
  if (!tema) return;

  temaAtual = tema;
  temaInput.value = '';
  formInput.classList.add('hidden');
  mostrarMensagem(`💬 Tema enviado: “${tema}”`);
  mostrarMensagem('🔎 Carregando opções para você...');

  setTimeout(() => {
    renderizarAcessorios();
    buscarAcessoriosDinamicos(tema).then(itens => {
      if (itens.length >= 3) renderizarEtapaB(itens);
    });

    // Exibir botão Gerar (desativado até seleção)
    gerarBtn.disabled = true;
    gerarBloco.classList.remove('hidden');
  }, 1200);
});

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

function atualizarSelecao() {
  const selecionados = [...acessoriosForm.querySelectorAll('input:checked')];
  acessoriosSelecionados = selecionados.map(input => input.value);
  gerarBtn.disabled = acessoriosSelecionados.length === 0;
}

gerarBtn.addEventListener('click', () => {
  acessoriosSection.classList.add('hidden');
  dinamicosSection?.classList.add('hidden');
  gerarBloco.classList.add('hidden');
  mostrarMensagem('🧠 Gerando prompt...');

  setTimeout(() => {
    const dinamicos = window._dinamicosSelecionados || [];
    const prompt = `Tema: ${temaAtual}

Incluir: ${[...acessoriosSelecionados, ...dinamicos].join(', ')}`;

    salvarPrompt(prompt); // salva nos recentes

    mostrarMensagem('✅ Pronto! Aqui está seu prompt:');
    promptPre.textContent = prompt;
    resultadoSection.classList.remove('hidden');
  }, 1500);
});

copiarBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(promptPre.textContent).then(() => {
    copiarBtn.textContent = '✅ Copiado!';
    setTimeout(() => {
      copiarBtn.textContent = '📋 Copiar';
      window.location.href = 'recentes.html'; // redireciona
    }, 800);
  });
});

novoBtn.addEventListener('click', () => {
  resultadoSection.classList.add('hidden');
  temaAtual = '';
  acessoriosSelecionados = [];
  window._dinamicosSelecionados = [];
  formInput.classList.remove('hidden');
  temaInput.focus();
  mostrarMensagem('📢 Digite outro tema para gerar um novo prompt.');
});

function mostrarMensagem(texto) {
  const div = document.createElement('div');
  div.className = 'mensagem-recepcao';
  div.textContent = texto;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}
