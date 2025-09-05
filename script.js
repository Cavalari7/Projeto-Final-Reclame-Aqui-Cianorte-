// script.js
import { addDenuncia, listarDenuncias, removerDenuncia } from "./denuncias-config.js";

const denunciaForm = document.getElementById("denuncia-form");
const container = document.getElementById("denuncias-container");

// Enviar nova denúncia
if (denunciaForm) {
  denunciaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    try {
      await addDenuncia(titulo, descricao);
      denunciaForm.reset();
    } catch (err) {
      alert("Erro ao enviar denúncia: " + err.message);
    }
  });
}

// Carregar denúncias em tempo real
if (container) {
  listarDenuncias((denuncias) => {
    container.innerHTML = "";
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
  });
}
