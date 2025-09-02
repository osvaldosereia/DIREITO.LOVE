(function(){
/* =========================
   Funções utilitárias
   ========================= */
const $ = s=>document.querySelector(s);
const el = (tag, cls, html)=>{ 
  const x=document.createElement(tag); 
  if(cls) x.className=cls; 
  if(html!=null) x.innerHTML=html; 
  return x; 
};
const sleep = ms=> new Promise(r=> setTimeout(r, ms));
const rand = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
const wait = (min=700,max=1200)=> matchMedia('(prefers-reduced-motion: reduce)').matches ? Promise.resolve() : sleep(rand(min,max));

/* =========================
   LocalStorage helper
   ========================= */
const LS = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def; }catch{ return def; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); return v; }
};

/* =========================
   Tema (dark/light/auto)
   ========================= */
function effectiveTheme(pref){ 
  if (pref === 'dark' || pref === 'light') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(pref){ 
  const eff = effectiveTheme(pref);
  document.documentElement.setAttribute('data-theme', eff);
  const meta = document.querySelector('meta[name="theme-color"][data-live]');
  if (meta) meta.setAttribute('content', eff === 'dark' ? '#15181c' : '#e9eaee');
  return eff;
}

/* =========================
   Estratégias e Labels
   ========================= */
const labels = {
  prova:'📘 Estudar p/ Prova',
  questoes:'📝 Resolver Questões',
  correlatos:'🔍 Explorar Temas Relacionados',
  apresentacao:'🎤 Apresentação Oral (5min)',
  decoreba:'⚡ Decoreba Expressa',
  casos:'⚖️ Casos Concretos',
  mapaMental:'🧠 Mapa Mental',
  errosProva:'🎯 Erros Clássicos',
  quadroComparativo:'📚 Quadro Analítico'
};
const allStrategies = Object.keys(labels);

/* =========================
   Templates de Prompts — atualizados e organizados
   ========================= */
const Prompts = {
  prova: `Você é um Professor de Direito altamente didático, especializado em provas da OAB e concursos.

🎯 OBJETIVO:
Ensinar de forma resumida, mas clara e completa, o tema **{{TEMA}}**, como se fosse a última revisão antes da prova.

📦 ENTREGÁVEL:
- Conceito direto e objetivo
- Base legal essencial (artigos resumidos)
- Jurisprudência majoritária (STF/STJ)
- Exemplos práticos
- Tópicos de fixação em bullet points
- 5 temas correlatos sugeridos

💚 direito.love`,

  questoes: `Você é um elaborador de questões de provas da OAB e concursos.

🎯 OBJETIVO:
Criar questões sobre o tema **{{TEMA}}** para treino.

📦 ENTREGÁVEL:
- 10 questões objetivas (A–E), com gabarito apenas no final
- 2 questões discursivas curtas, com gabarito padrão no final
- Explicações sucintas após cada resposta

💚 direito.love`,

  correlatos: `Você é um Professor de Direito e pesquisador.

🎯 OBJETIVO:
Expandir o estudo do tema **{{TEMA}}** para áreas conexas.

📦 ENTREGÁVEL:
- Lista de 20 temas correlatos devidamente linkados para pesquisa automatica no google.
- Dividir em: Direito Constitucional, Civil, Penal, Processo, Trabalho, Empresarial e Atualidades
- Indicar em 1 linha a relevância de cada tema para concursos e OAB

💚 direito.love`,

  apresentacao: `Você é um professor-orador especialista em direito brasileiro do projeto direito.love.

🎯 OBJETIVO:
Gerar um roteiro de apresentação oral de 5 minutos sobre o tema **{{TEMA}}**.

📦 ROTEIRO:
- 0:00–0:30 → Abertura contextualizando
- 0:30–3:30 → Desenvolvimento com 3 argumentos principais
- 3:30–4:30 → Exemplo prático ou caso real
- 4:30–5:00 → Conclusão com frase de impacto

Inclua:
- Script de fala
- Destaque de frases de efeito

💚 direito.love`,

  decoreba: `Você é um Professor de memorização jurídica.

🎯 OBJETIVO:
Transformar o tema **{{TEMA}}** em material de memorização rápida.

📦 ENTREGÁVEL:
- 15 assertivas diretas
- 5 siglas ou mnemônicos criativos
- 3 confusões clássicas comparadas
- 5 flashcards pergunta ↔ resposta
- Checklist final

💚 direito.love`,

  casos: `Você é um Professor de Direito prático especialista em criação de casos concretos com base em provas de bancas famosas como FGV.

🎯 OBJETIVO:
Explicar o tema **{{TEMA}}** por meio de casos concretos.

📦 ENTREGÁVEL:
- 3 casos práticos narrados em até 6 linhas cada
- Resolução fundamentada de cada caso
- Indicação da base legal usada
- Observação sobre entendimento jurisprudencial

💚 direito.love`,

  mapaMental: `Você é um Professor especialista em organização de estudos e criador de mapas mentais em forma de texto usando emojis e estrategias de escrita criativas.

🎯 OBJETIVO:
Criar um mapa mental do tema **{{TEMA}}**.

📦 ENTREGÁVEL:
- Estrutura hierárquica em tópicos e subtópicos
- Conexões lógicas entre os pontos
- Destaque dos artigos principais
- Palavras-chave em maiúsculas
- Sugestão visual de ícones, emojis e setas para representar

💚 direito.love`,

  errosProva: `Você é um Professor de Direito experiente em provas de concurso de bancas famosas e provas da oab.

🎯 OBJETIVO:
Apontar os erros clássicos que estudantes cometem ao estudar o tema **{{TEMA}}**.

📦 ENTREGÁVEL:
- Lista de 10 erros comuns
- Correção imediata de cada erro
- Breve explicação do motivo do erro
- Como evitar cair na pegadinha

💚 direito.love`,

  quadroComparativo: `Você é um Professor de Direito e comparatista experiente, sempre muito atualizado.

🎯 OBJETIVO:
Gerar um quadro analítico completo do tema **{{TEMA}}**.

📦 ENTREGÁVEL:
- Quadro comparativo com 3 colunas: Aspecto | Ponto principal | Observação prática
- Inclusão da base legal resumida
- Jurisprudência majoritária resumida
- Observações práticas para OAB e concursos

💚 direito.love`
};

function promptFor(strategy, tema){ 
  return (Prompts[strategy]||'').replaceAll('{{TEMA}}', tema); 
}

/* =========================
   Helpers de UI
   ========================= */
