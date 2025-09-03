(function () {
'use strict';
const $=(s,e=document)=>e.querySelector(s);const $$=(s,e=document)=>Array.from(e.querySelectorAll(s));
const toast=(m)=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);};
const state={tema:'',salvos:[]};
const SALVOS_KEY='questgpt:salvos';
function salvar(p){let arr=JSON.parse(localStorage.getItem(SALVOS_KEY)||'[]');arr.unshift(p);if(arr.length>100)arr.pop();localStorage.setItem(SALVOS_KEY,JSON.stringify(arr));}
function renderSalvos(){const ul=$('#listaSalvos');ul.innerHTML='';let arr=JSON.parse(localStorage.getItem(SALVOS_KEY)||'[]');arr.forEach(p=>{const li=document.createElement('li');li.textContent=p.tema;ul.appendChild(li);});}
function addMsg(txt,cls='app'){const c=$('#chat');const w=document.createElement('div');w.className='msg '+cls;const b=document.createElement('div');b.className='bubble';b.textContent=txt;w.appendChild(b);c.appendChild(w);c.scrollTop=c.scrollHeight;}
function welcome(){addMsg('Bem-vindo! Digite um tema.');}
const composer=$('#composer');const temaInput=$('#tema');const charCount=$('#charCount');
temaInput.addEventListener('input',()=>charCount.textContent=temaInput.value.length);
composer.addEventListener('submit',(e)=>{e.preventDefault();const tema=temaInput.value.trim();if(!tema){toast('Digite um tema');return;}state.tema=tema;addMsg(tema,'user');setTimeout(()=>showOptions(),3000);temaInput.value='';charCount.textContent=0;});
function showOptions(){const opts=['Explicação Rápida','Checklist','Questões Objetivas','Casos Concretos','Doutrina','Jurisprudência','Artigos','Prática Jurídica','Debate'];const form=document.createElement('form');opts.forEach(o=>{const l=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.value=o;l.append(cb,o);form.appendChild(l);});const btn=document.createElement('button');btn.type='button';btn.textContent='Gerar Prompt';btn.onclick=()=>gerarPrompt(form);form.appendChild(btn);addMsg('O que devemos incluir?');$('#chat').appendChild(form);}
function gerarPrompt(form){const inc=Array.from(form.querySelectorAll('input:checked')).map(i=>i.value);if(!inc.length){toast('Selecione algo');return;}const p={tema:state.tema,conteudo:inc};const texto=`Tema: ${p.tema}\nItens: ${p.conteudo.join(', ')}\n---\ndireito.love`;addMsg(texto);salvar(p);}
$('#year').textContent=new Date().getFullYear();welcome();})();