import { db, auth } from "./firebase-config.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const container = document.getElementById("admin-denuncias-container");

async function carregarDenuncias() {
  container.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "denuncias"));
  querySnapshot.forEach((d) => {
    const denuncia = d.data();
    const div = document.createElement("div");
    div.classList.add("denuncia-card");
    div.innerHTML = `
      <h3>${denuncia.titulo}</h3>
      <p>${denuncia.descricao}</p>
      <button data-id="${d.id}" class="delete-btn">Remover</button>
    `;
    container.appendChild(div);
  });
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    await deleteDoc(doc(db, "denuncias", id));
    carregarDenuncias();
  }
});

carregarDenuncias();
