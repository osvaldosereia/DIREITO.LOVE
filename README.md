# 📚 direito.love — PWA Educacional

App educacional estático (PWA) que gera **prompts de estudo** (questões, flashcards, simulados, etc.) a partir de:
- 🎯 **Tema**
- 📄 **Texto**
- 🎥 **YouTube**
- 📎 **Arquivo** (⚠️ apenas descrito, não processado no app)

---

## 🚀 Recursos
- 100% **client-side** (HTML, CSS, JS puro)
- **PWA Ready**: funciona offline, instalável no celular
- Compatível com **iOS (Safari/WebKit)** e **Android (Chrome/Edge)**
- Estrutura **HTML5 semântica** + **WCAG AA** acessibilidade
- UX otimizada: topbar, accordion, modal, drawer
- **Favoritos** salvos em localStorage
- **Compartilhamento WhatsApp** integrado
- **Dark mode automático** (com opção manual)

---

## 📦 Estrutura de Arquivos
```
/
├─ index.html          # Estrutura semântica
├─ styles.css          # Estilos responsivos
├─ app.js              # Lógica do app
├─ manifest.json       # Manifesto PWA
├─ service-worker.js   # Cache offline
├─ pwa-144.png
├─ pwa-180.png
├─ pwa-192.png
├─ pwa-512.png
└─ pwa-1024.png
```

---

## 🔧 Como Rodar Localmente
1. Baixe o repositório (`Code → Download ZIP`) ou clone.
2. Sirva a pasta em um **servidor local** (PWA exige contexto HTTP):
   ```bash
   python -m http.server 8080
   ```
   ou use o **Live Server** no VS Code.
3. Acesse em `http://localhost:8080`.
4. Abra no navegador (Chrome/Edge/Safari) → Adicione à Tela Inicial.

> ⚠️ O offline só funciona após o **primeiro carregamento com internet** (arquivos cacheados).

---

## 🌐 Publicação no GitHub Pages
1. Crie um repositório no GitHub e suba todos os arquivos.
2. Vá em **Settings → Pages** e selecione:
   - Deploy from branch → `main`
   - Pasta: `/ (root)`
3. Acesse: `https://seu-usuario.github.io/direito.love/`
4. Teste a instalação como PWA no celular.

---

## 📱 Boas Práticas iOS & Android
- Botões ≥ 44px (Apple HIG)
- Fonte ≥ 16px
- Sem scroll lateral
- Contraste WCAG AA
- Drawer lateral com acessibilidade (`aria-hidden`)
- Modal com `aria-modal` e fechamento por clique fora

---

## 🔐 Privacidade
- Sem login, sem coleta de dados pessoais
- Sem analytics obrigatório
- Apenas uso educacional
- Marcas (ChatGPT, Gemini, Perplexity) citadas **somente como compatibilidade**

---

## 📝 Roadmap Futuro
- [ ] Internacionalização (i18n)
- [ ] Gamificação (contadores de progresso)
- [ ] Melhorias no design do modal

---

## 👨‍💻 Contribuição
- Ajuste objetivos em `app.js` ou via JSON futuro
- Melhore estilos em `styles.css`
- Teste em dispositivos móveis

---

## 📌 Licença
Este projeto é **educacional** e livre para uso não comercial.
