import { db, auth } from "./firebase-config.js";
import { 
  addDoc, collection, query, orderBy, getDocs, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("submit", async (e) => {
  if (e.target.classList.contains("comment-form")) {
    e.preventDefault();
    const denunciaId = e.target.dataset.id;
    const input = e.target.querySelector("input");
    const texto = input.value;

    await addDoc(collection(db, "denuncias", denunciaId, "comentarios"), {
      texto,
      user: auth.currentUser ? auth.currentUser.email : "anônimo",
      createdAt: serverTimestamp()
    });

    input.value = "";
    carregarComentarios(denunciaId);
  }
});

async function carregarComentarios(denunciaId) {
  const commentsDiv = document.getElementById(`comments-${denunciaId}`);
  commentsDiv.innerHTML = "";
  const q = query(
    collection(db, "denuncias", denunciaId, "comentarios"),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const c = doc.data();
    const p = document.createElement("p");
    p.innerHTML = `<strong>${c.user}:</strong> ${c.texto}`;
    commentsDiv.appendChild(p);
  });
}
