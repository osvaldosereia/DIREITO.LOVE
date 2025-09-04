
// recents.js — persistência local de prompts
const STORAGE_KEY = 'recent_prompts_v1';

export function listarPrompts(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
export function salvarPrompt(texto, meta={}){
  const lista = listarPrompts();
  lista.unshift({ texto, quando: new Date().toISOString(), ...meta });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista.slice(0, 50)));
}
export function removerPrompt(index){
  const lista = listarPrompts();
  if (index<0 || index>=lista.length) return;
  lista.splice(index,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}
