function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

function registrarDenuncia() {
  let anonimo = document.getElementById("anonimo").checked;
  let nome = anonimo ? "Anônimo" : document.getElementById("nomeDenunciante").value;
  let tipo = document.getElementById("tipo").value;
  let titulo = document.getElementById("titulo").value;
  let descricao = document.getElementById("descricao").value;
  let bairro = document.getElementById("bairro").value;
  let rua = document.getElementById("rua").value;
  let data = document.getElementById("data").value;

  if (!titulo || !descricao) {
    alert("Preencha pelo menos o título e a descrição!");
    return;
  }

  db.collection("denuncias").add({
    nome,
    tipo,
    titulo,
    descricao,
    bairro,
    rua,
    data,
    comentarios: [],
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    carregarDenuncias();
  });
}

function carregarDenuncias() {
  let container = document.getElementById("denuncias");
  container.innerHTML = "";

  db.collection("denuncias").orderBy("timestamp", "desc").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        let d = doc.data();
        let div = document.createElement("div");
        div.classList.add("denuncia");

        div.innerHTML = `
          <h3>${d.titulo} - <small>${d.tipo}</small></h3>
          <p><b>Autor:</b> ${d.nome}</p>
          <p>${d.descricao}</p>
          <p><b>Local:</b> ${d.bairro}, ${d.rua} | <b>Data:</b> ${d.data || "Não informada"}</p>
          <div class="comentarios">
            <h4>Comentários</h4>
            <div id="comentarios-${doc.id}">
              ${(d.comentarios || []).map(c => `<p>${c}</p>`).join("")}
            </div>
            <input type="text" id="comentario-${doc.id}" placeholder="Escreva um comentário...">
            <button onclick="comentar('${doc.id}')">Comentar</button>
          </div>
        `;
        container.appendChild(div);
      });
    });
}

function comentar(denunciaId) {
  let input = document.getElementById(`comentario-${denunciaId}`);
  let comentario = input.value;

  if (!comentario) return;

  let denunciaRef = db.collection("denuncias").doc(denunciaId);

  denunciaRef.update({
    comentarios: firebase.firestore.FieldValue.arrayUnion(comentario)
  }).then(() => {
    carregarDenuncias();
  });
}

window.onload = carregarDenuncias;
