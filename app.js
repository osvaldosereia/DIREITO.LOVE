/* ==========================
   direito.love — app.js (2025-09 • estável + patches)
   Regras:
   1) Cada card = bloco entre linhas "-----"
   2) Texto preservado como no .txt (parênteses incluídos)
   3) "Respiros" (linhas em branco) apenas na visualização do leitor
   ========================== */

/* Service Worker (opcional) */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);

/* === Remove links de qualquer parte do conteúdo === */
function sanitizeCardText(item) {
  const lines = item.text.split("\n");
  const filteredLines = lines.filter((line) => !/\b(?:https?:\/\/|www\.)\S+/i.test(line));
  return filteredLines.join("\n").trim();
}

...

/* Substituições em renderCard */
function renderCard(item, tokens = [], ctx = { context: "results" }) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = item.id;
  if (item.source) card.setAttribute("data-source", item.source);

  const left = document.createElement("div");

  if (item.source && ctx.context !== "reader") {
    const pill = document.createElement("a");
    pill.href = "#";
    pill.className = "pill";
    pill.textContent = `📘 ${item.source} (abrir)`;
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      openReader(item);
    });
    left.append(pill);
  }

  const body = document.createElement("div");
  body.className = "body";

  if (ctx.context === "reader") {
    let visualText = sanitizeCardText(item);
    body.innerHTML = highlight(visualText, tokens);
  } else {
    body.classList.add("is-collapsed");
    let visualText = sanitizeCardText(item);
    body.innerHTML = truncatedHTML(visualText, tokens);
  }

  ...
}
