// comments.js
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Enviar comentário
document.addEventListener("submit", async (e) => {
  if (e.target.classList.contains("comment-form")) {
    e.preventDefault();
    const form = e.target;
    const denunciaId = form.dataset.id;
    const input = form.querySelector("input");
    const texto = input.value;

    await addDoc(collection(db, "denuncias", denunciaId, "comentarios"), {
      texto,
      user: auth.currentUser ? auth.currentUser.email : "anônimo",
      createdAt: serverTimestamp()
    });

    input.value = "";
  }
});

// Carregar comentários em tempo real
function carregarComentarios(denunciaId) {
  const commentsDiv = document.getElementById(`comments-${denunciaId}`);
  const q = query(collection(db, "denuncias", denunciaId, "comentarios"), orderBy("createdAt", "asc"));
  onSnapshot(q, (snapshot) => {
    commentsDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const c = doc.data();
      const p = document.createElement("p");
      p.innerHTML = `<strong>${c.user}:</strong> ${c.texto}`;
      commentsDiv.appendChild(p);
    });
  });
}

// Observa cada form para carregar comentários
document.addEventListener("focusin", (e) => {
  if (e.target.closest(".comment-form")) {
    const form = e.target.closest(".comment-form");
    carregarComentarios(form.dataset.id);
  }
});
