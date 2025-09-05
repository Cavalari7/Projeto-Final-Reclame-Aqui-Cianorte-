// denuncias-config.js
import { db, auth } from "./firebase-config.js";
import { 
  addDoc, collection, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Adicionar denúncia
export async function addDenuncia(titulo, descricao) {
  return await addDoc(collection(db, "denuncias"), {
    titulo,
    descricao,
    user: auth.currentUser ? auth.currentUser.email : "anônimo",
    createdAt: serverTimestamp()
  });
}

// Listar denúncias (ordem decrescente)
export async function listarDenuncias(callback) {
  const q = query(collection(db, "denuncias"), orderBy("createdAt", "desc"));
  // Atualização em tempo real
  onSnapshot(q, (snapshot) => {
    const denuncias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(denuncias);
  });
}

// Remover denúncia
export async function removerDenuncia(id) {
  await deleteDoc(doc(db, "denuncias", id));
}
