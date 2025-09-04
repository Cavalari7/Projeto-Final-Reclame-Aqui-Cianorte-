import { addDenuncia, listarDenuncias } from "./denuncias-config.js";

const denunciaForm = document.getElementById("denuncia-form");
const container = document.getElementById("denuncias-container");

if (denunciaForm) {
  denunciaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;

    try {
      await addDenuncia(titulo, descricao);
      denunciaForm.reset();
      carregarDenuncias();
    } catch (error) {
      alert("Erro ao enviar denúncia: " + error.message);
    }
  });
}

export async function carregarDenuncias() {
  if (!container) return;
  container.innerHTML = "";
  const denuncias = await listarDenuncias();

  denuncias.forEach((d) => {
    const div = document.createElement("div");
    div.classList.add("denuncia-card");
    div.innerHTML = `
      <h3>${d.titulo}</h3>
      <p>${d.descricao}</p>
      <small>Autor: ${d.user}</small>
      <div class="comments" id="comments-${d.id}"></div>
      <form class="comment-form" data-id="${d.id}">
        <input type="text" placeholder="Escreva um comentário..." required>
        <button type="submit">Comentar</button>
      </form>
    `;
    container.appendChild(div);
  });
}

if (container) carregarDenuncias();
