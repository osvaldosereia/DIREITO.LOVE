
const STORAGE_KEY='recent_prompts_v1';
export function listarPrompts(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');}catch{return[]} }
export function salvarPrompt(texto, meta={}){
  const arr=listarPrompts();
  arr.unshift({ texto, quando:new Date().toISOString(), ...meta });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0,50)));
}
export function removerPrompt(i){
  const arr=listarPrompts();
  if(i<0||i>=arr.length) return;
  arr.splice(i,1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
