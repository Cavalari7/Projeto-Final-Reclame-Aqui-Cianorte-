function mostrarCadastro() {
  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("cadastro-box").classList.remove("hidden");
}

function mostrarLogin() {
  document.getElementById("cadastro-box").classList.add("hidden");
  document.getElementById("login-box").classList.remove("hidden");
}

function cadastrar() {
  let nome = document.getElementById("cad-nome").value;
  let email = document.getElementById("cad-email").value;
  let senha = document.getElementById("cad-senha").value;
  let confirmar = document.getElementById("cad-confirmar").value;

  if (senha !== confirmar) {
    alert("As senhas não coincidem!");
    return;
  }

  auth.createUserWithEmailAndPassword(email, senha)
    .then(cred => {
      return db.collection("usuarios").doc(cred.user.uid).set({ nome, email });
    })
    .then(() => {
      alert("Cadastro realizado com sucesso!");
      mostrarLogin();
    })
    .catch(err => alert(err.message));
}

function login() {
  let email = document.getElementById("login-email").value;
  let senha = document.getElementById("login-senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => { window.location.href = "denuncias.html"; })
    .catch(err => alert("Erro: " + err.message));
}
