// admin.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { listarDenuncias, removerDenuncia } from "./denuncias-config.js";

const container = document.getElementById("admin-denuncias");

// Verificar se é admin
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "login.html";

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    alert("Acesso negado!");
    return window.location.href = "index.html";
  }

  // Carregar denúncias
  listarDenuncias((denuncias) => {
    container.innerHTML = "";
    denuncias.forEach((d) => {
      const div = document.createElement("div");
      div.classList.add("denuncia-card");
      div.innerHTML = `
        <h3>${d.titulo}</h3>
        <p>${d.descricao}</p>
        <small>Autor: ${d.user}</small>
        <button data-id="${d.id}" class="remover">Remover</button>
      `;
      container.appendChild(div);
    });

    // Botões de remover
    container.querySelectorAll(".remover").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await removerDenuncia(btn.dataset.id);
      });
    });
  });
});
