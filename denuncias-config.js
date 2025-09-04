import { db, auth } from "./firebase-config.js";
import { 
  addDoc, collection, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function addDenuncia(titulo, descricao) {
  return await addDoc(collection(db, "denuncias"), {
    titulo,
    descricao,
    user: auth.currentUser ? auth.currentUser.email : "anônimo",
    createdAt: serverTimestamp()
  });
}

export async function listarDenuncias() {
  const q = query(collection(db, "denuncias"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

export async function removerDenuncia(id) {
  await deleteDoc(doc(db, "denuncias", id));
}
