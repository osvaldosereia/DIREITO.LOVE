# direito.love — Chat PWA (preto & branco, coração verde)
## Análise final antes do deploy
- Pacing de mensagens: “...” inicial 1s; demais 0.7–1.2s; campo aparece rápido.
- Confirmação de cópia: toast + eco no chat; fallback manual se clipboard falhar.
- Acessibilidade: diálogo com aria, foco no botão principal e retorno do foco ao fechar.
- Responsividade: barra base larga, com wrap; não encavala em telas pequenas.
- Offline: aviso simples; SW com cache bust (dl-v3).
- Play Store: `privacy.html`; manifest+SW ok; HTTPS exigido.

## Publicação na Play Store via TWA (resumo)
1) `npm i -g @bubblewrap/cli`
2) `bubblewrap init --manifest=https://SEU_DOMINIO/manifest.json`
3) Ajuste pacote e ícones (substitua /icons/*).
4) `bubblewrap build` → gere AAB.
5) Suba no Play Console com screenshots e URL da Política de Privacidade.

