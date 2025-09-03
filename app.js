/*
QuestGPT — app.js
- 100% client-side, sem dependências externas
- Fluxo: Boas-vindas → tema (80 chars) → pensando (3s) → seleção obrigatória → (opcional) dicas JSON → gerar prompt → copiar/salvar/compartilhar
- Acessibilidade: ARIA, foco, toasts; iOS/Android UX: touch 44px, keyboard-safe area, toasts
*/
(function () {
'use strict';


// ===== Utilidades =====
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const toast = (msg, timeout = 2200) => {
const t = $('#toast');
if (!t) return; t.textContent = msg; t.classList.add('show');
window.setTimeout(() => t.classList.remove('show'), timeout);
};
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));


const state = {
tema: '',
includeOptions: [],
dicasEncontradas: [],
dicasSelecionadas: [],
currentView: '#/chat',
installPromptEvent: null,
};


const INCLUDE_OPTS = [
'Explicação Rápida', 'Cheklist', '(0-10) Questões Objetivsa', '(0-3) Questões Dissertativas', '(0-3) Casos Concretos', 'Doutrina', 'Jurisprudencia', 'Artigos Correlatos', 'Relação Processual', 'Pratica Jurídica', 'Debate', 'Erros Comuns', 'Peganinhas de Provas', 'Dicas de Pesquisa', 'Curiosidades', 'Quadro Comparativo'
];


// Correções ortográficas internas (não alteram UI do usuário)
const NORMALIZE = {
'Cheklist': 'Checklist',
'Questões Objetivsa': 'Questões Objetivas',
'Peganinhas de Provas': 'Pegadinhas de Provas',
'Pratica Jurídica': 'Prática Jurídica'
};


// ===== Roteador simples (hash) =====
function setRoute(hash) {
state.currentView = hash;
const views = $$('.view');
views.forEach(v => v.hidden = true);
if (hash === '#/salvos') $('#view-salvos').hidden = false;
else if (hash === '#/como-usar') $('#view-como-usar').hidden = false;
else if (hash === '#/sobre') $('#view-sobre').hidden = false;
else $('#view-chat').hidden = false;
// Ajusta foco inicial
if (hash === '#/chat') $('#tema').focus();
if (hash === '#/salvos') renderSalvos();
}
})();
