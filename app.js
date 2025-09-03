(function () {
'use strict';
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const toast = (msg) => { const t=$('#toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2000); };
const state={tema:'',includeOptions:[]};
const INCLUDE_OPTS=['Explicação Rápida','Checklist','Questões Objetivas'];
function addMsg(txt){const c=$('#chat');const d=document.createElement('div');d.textContent=txt;c.appendChild(d);}
function welcome(){addMsg('Bem-vindo! Digite um tema.');}
const composer=$('#composer'); const temaInput=$('#tema'); const enviarBtn=$('#enviar'); const charCount=$('#charCount');
temaInput.addEventListener('input',()=>{charCount.textContent=temaInput.value.length;});
composer.addEventListener('submit',(e)=>{e.preventDefault();const tema=temaInput.value.trim();if(!tema){toast('Digite um tema');return;}state.tema=tema;addMsg('Tema: '+tema);setTimeout(()=>{showIncludeSelector();},3000);temaInput.value='';charCount.textContent=0;});
function showIncludeSelector(){const form=document.createElement('form');INCLUDE_OPTS.forEach(opt=>{const l=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.value=opt;l.append(cb,opt);form.appendChild(l);});const btn=document.createElement('button');btn.textContent='Gerar Prompt';btn.type='button';btn.onclick=()=>gerarPrompt();form.appendChild(btn);addMsg('O que devemos incluir?');$('#chat').appendChild(form);}
function gerarPrompt(){const inc=$$('#chat input:checked').map(i=>i.value);if(!inc.length){toast('Selecione algo');return;}const prompt='Tema: '+state.tema+'\nIncluir: '+inc.join(', ');addMsg(prompt);}
$('#year').textContent=new Date().getFullYear();welcome();
})();