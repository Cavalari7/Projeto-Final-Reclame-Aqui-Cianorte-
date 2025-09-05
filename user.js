import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { addDoc, collection, serverTimestamp, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const denunciaForm = document.getElementById("denuncia-form");
const container = document.getElementById("denuncias-container");

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("logout-btn").style.display = "inline";
    document.getElementById("login-link").style.display = "none";
    document.getElementById("register-link").style.display = "none";
  }
});

if (denunciaForm) {
  denunciaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    try {
      await addDoc(collection(db, "denuncias"), {
        titulo,
        descricao,
        user: auth.currentUser ? auth.currentUser.uid : "anônimo",
        createdAt: serverTimestamp()
      });
      denunciaForm.reset();
      carregarDenuncias();
    } catch (error) {
      alert("Erro ao enviar denúncia: " + error.message);
    }
  });
}

async function carregarDenuncias() {
  container.innerHTML = "";
  const q = query(collection(db, "denuncias"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const d = doc.data();
    const div = document.createElement("div");
    div.classList.add("denuncia-card");
    div.innerHTML = `
      <h3>${d.titulo}</h3>
      <p>${d.descricao}</p>
      <small>${d.user}</small>
      <div class="comments" id="comments-${doc.id}"></div>
      <form class="comment-form" data-id="${doc.id}">
        <input type="text" placeholder="Escreva um comentário..." required>
        <button type="submit">Comentar</button>
      </form>
    `;
    container.appendChild(div);
  });
}

if (container) carregarDenuncias();
