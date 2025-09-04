/*
app.js - VERSÃO CORRIGIDA E COMPLETA
Lógica principal do app direito.love
*/

// ================== VARIÁVEIS GLOBAIS ==================
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
let dinamicosSelecionados = [];

// ================== INICIALIZAÇÃO ==================
function inicializarApp() {
    configurarEventListeners();
    resetarApp();
}

function configurarEventListeners() {
    // Event listener para envio do formulário principal
    if (formInput) {
        formInput.addEventListener('submit', handleTemaSubmit);
    }
    
    // Event listeners para botões de ação
    if (gerarBtn) {
        gerarBtn.addEventListener('click', handleGerarPrompt);
    }
    
    if (copiarBtn) {
        copiarBtn.addEventListener('click', handleCopiarPrompt);
    }
    
    if (novoBtn) {
        novoBtn.addEventListener('click', handleNovoPrompt);
    }
}

// ================== HANDLERS DE EVENTOS ==================
function handleTemaSubmit(e) {
    e.preventDefault();
    
    const tema = temaInput.value.trim();
    if (!tema) {
        mostrarMensagem('⚠️ Por favor, digite um tema válido.');
        return;
    }

    temaAtual = tema;
    temaInput.value = '';
    formInput.classList.add('hidden');

    mostrarMensagem(`💬 Tema enviado: "${tema}"`);
    mostrarMensagem('🔎 Carregando opções para você...');

    setTimeout(() => {
        try {
            renderizarAcessorios();
            carregarAcessoriosDinamicos(tema);
        } catch (error) {
            console.error('Erro ao carregar acessórios:', error);
            mostrarMensagem('❌ Erro ao carregar opções. Tente novamente.');
        }
    }, 1200);
}

function handleGerarPrompt() {
    try {
        // Esconder seções
        acessoriosSection?.classList.add('hidden');
        dinamicosSection?.classList.add('hidden');
        gerarBloco?.classList.add('hidden');

        mostrarMensagem('🧠 Gerando prompt...');

        setTimeout(() => {
            const prompt = gerarPromptFinal();
            
            if (prompt) {
                // Salvar prompt (se função existir)
                if (typeof salvarPrompt === 'function') {
                    salvarPrompt(prompt);
                }
                
                mostrarMensagem('✅ Pronto! Aqui está seu prompt:');
                promptPre.textContent = prompt;
                resultadoSection?.classList.remove('hidden');
            } else {
                mostrarMensagem('❌ Erro ao gerar prompt. Tente novamente.');
                resetarParaSelecao();
            }
        }, 1500);
    } catch (error) {
        console.error('Erro ao gerar prompt:', error);
        mostrarMensagem('❌ Erro inesperado. Tente novamente.');
        resetarParaSelecao();
    }
}

function handleCopiarPrompt() {
    const texto = promptPre?.textContent;
    
    if (!texto) {
        mostrarMensagem('❌ Nenhum prompt para copiar.');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto)
            .then(() => {
                copiarBtn.textContent = '✅ Copiado!';
                setTimeout(() => {
                    copiarBtn.textContent = '📋 Copiar';
                    window.location.href = 'recentes.html';
                }, 800);
            })
            .catch(err => {
                console.error('Erro ao copiar:', err);
                fallbackCopy(texto);
            });
    } else {
        fallbackCopy(texto);
    }
}

function fallbackCopy(texto) {
    // Fallback para navegadores mais antigos
    try {
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copiarBtn.textContent = '✅ Copiado!';
        setTimeout(() => {
            copiarBtn.textContent = '📋 Copiar';
        }, 800);
    } catch (err) {
        console.error('Erro no fallback de cópia:', err);
        mostrarMensagem('❌ Erro ao copiar. Tente selecionar e copiar manualmente.');
    }
}

function handleNovoPrompt() {
    resetarApp();
    mostrarMensagem('📢 Digite outro tema para gerar um novo prompt.');
}

// ================== FUNÇÕES DE RENDERIZAÇÃO ==================
function renderizarAcessorios() {
    if (!acessoriosForm) {
        console.error('Formulário de acessórios não encontrado');
        mostrarMensagem('❌ Erro na interface. Recarregue a página.');
        return;
    }

    // Verificar se acessoriosFixos está definido
    if (typeof acessoriosFixos === 'undefined') {
        console.error('acessoriosFixos não está definido');
        mostrarMensagem('❌ Erro ao carregar acessórios fixos.');
        return;
    }

    acessoriosForm.innerHTML = '';

    acessoriosFixos.forEach((item, index) => {
        const checkbox = criarCheckbox(`acessorio-${index}`, item, atualizarSelecaoAcessorios);
        acessoriosForm.appendChild(checkbox);
    });

    acessoriosSection?.classList.remove('hidden');
    
    // Inicializar botão gerar como desabilitado
    if (gerarBtn) {
        gerarBtn.disabled = true;
    }
    gerarBloco?.classList.remove('hidden');
}

function renderizarEtapaDinamica(itens) {
    if (!dinamicosForm || !itens || itens.length === 0) {
        return;
    }

    dinamicosForm.innerHTML = '';

    itens.forEach((item, index) => {
        const valor = item.titulo || item.nome || `Item ${index + 1}`;
        const checkbox = criarCheckbox(`dinamico-${index}`, valor, atualizarSelecaoDinamicos);
        
        // Adicionar informações extras se disponíveis
        if (item.tipo) {
            checkbox.querySelector('input').dataset.tipo = item.tipo;
        }
        
        dinamicosForm.appendChild(checkbox);
    });

    dinamicosSection?.classList.remove('hidden');
}

// ================== FUNÇÕES AUXILIARES ==================
function criarCheckbox(id, texto, onChangeHandler) {
    const label = document.createElement('label');
    label.htmlFor = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.value = texto;
    checkbox.addEventListener('change', onChangeHandler);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${texto}`));

    return label;
}

function atualizarSelecaoAcessorios() {
    if (!acessoriosForm) return;
    
    const selecionados = [...acessoriosForm.querySelectorAll('input:checked')];
    acessoriosSelecionados = selecionados.map(input => input.value);
    atualizarEstadoBotaoGerar();
}

function atualizarSelecaoDinamicos() {
    if (!dinamicosForm) return;
    
    const selecionados = [...dinamicosForm.querySelectorAll('input:checked')];
    dinamicosSelecionados = selecionados.map(input => input.value);
}

function atualizarEstadoBotaoGerar() {
    if (!gerarBtn) return;
    
    const temSelecao = acessoriosSelecionados.length > 0;
    gerarBtn.disabled = !temSelecao;
}

function gerarPromptFinal() {
    if (!temaAtual) {
        console.error('Tema atual não definido');
        return null;
    }

    const todosAcessorios = [...acessoriosSelecionados, ...dinamicosSelecionados];
    
    if (todosAcessorios.length === 0) {
        mostrarMensagem('⚠️ Selecione pelo menos um acessório.');
        return null;
    }
    
    return `Tema: ${temaAtual}
Incluir: ${todosAcessorios.join(', ')}`;
}

async function carregarAcessoriosDinamicos(tema) {
    try {
        // Verificar se a função buscarAcessoriosDinamicos existe
        if (typeof buscarAcessoriosDinamicos === 'function') {
            const itens = await buscarAcessoriosDinamicos(tema);
            
            if (itens && itens.length >= 3) {
                renderizarEtapaDinamica(itens);
            }
        } else {
            console.warn('Função buscarAcessoriosDinamicos não encontrada');
        }
    } catch (error) {
        console.error('Erro ao buscar acessórios dinâmicos:', error);
        // Não mostrar erro para o usuário, pois é funcionalidade opcional
    }
}

function mostrarMensagem(texto) {
    if (!chatArea) {
        console.error('Área de chat não encontrada');
        return;
    }

    const div = document.createElement('div');
    div.className = 'mensagem-recepcao';
    div.textContent = texto;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function resetarApp() {
    // Reset das variáveis
    temaAtual = '';
    acessoriosSelecionados = [];
    dinamicosSelecionados = [];
    
    // Reset da interface
    resultadoSection?.classList.add('hidden');
    acessoriosSection?.classList.add('hidden');
    dinamicosSection?.classList.add('hidden');
    gerarBloco?.classList.add('hidden');
    formInput?.classList.remove('hidden');
    
    // Limpar formulários
    if (acessoriosForm) acessoriosForm.innerHTML = '';
    if (dinamicosForm) dinamicosForm.innerHTML = '';
    
    // Reset botões
    if (copiarBtn) copiarBtn.textContent = '📋 Copiar';
    
    // Focar no input
    if (temaInput) {
        temaInput.focus();
    }
}

function resetarParaSelecao() {
    // Volta para a tela de seleção em caso de erro
    acessoriosSection?.classList.remove('hidden');
    dinamicosSection?.classList.remove('hidden');
    gerarBloco?.classList.remove('hidden');
}

// ================== COMPATIBILIDADE COM CÓDIGO EXISTENTE ==================
// Mantém compatibilidade com renderizarEtapaB se for chamada pelo busca-legislacao.js
window.renderizarEtapaB = renderizarEtapaDinamica;

// ================== INICIALIZAÇÃO QUANDO DOM CARREGADO ==================
document.addEventListener('DOMContentLoaded', inicializarApp);

// Inicialização adicional para casos onde o DOM já foi carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}