import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { listarDenuncias, removerDenuncia } from "./denuncias-config.js";

const container = document.getElementById("admin-denuncias");
const logoutBtn = document.getElementById("logout-btn");

const totalSpan = document.getElementById("total-denuncias");
const novasSpan = document.getElementById("novas-denuncias");

const filterAuthor = document.getElementById("filter-author");
const filterDate = document.getElementById("filter-date");
const applyFilter = document.getElementById("apply-filter");
const clearFilter = document.getElementById("clear-filter");

let todasDenuncias = [];

// Carregar denúncias e atualizar gráficos
function carregarDenuncias(denuncias) {
  container.innerHTML = "";
  let novasCount = 0;

  denuncias.forEach((d) => {
    const div = document.createElement("div");
    div.classList.add("denuncia-card");

    // Cores por status
    let statusClass = "";
    if (d.status === "urgente") statusClass = "status-urgente";
    else if (d.status === "resolvido") statusClass = "status-resolvido";
    else statusClass = "status-normal";

    const isNew = !d.viewed;
    const novoLabel = isNew ? `<span class="novo">Novo</span>` : "";
    if (isNew) novasCount++;

    div.innerHTML = `
      <h3 class="${statusClass}">${d.titulo} ${novoLabel}</h3>
      <p>${d.descricao}</p>
      <small>Autor: ${d.user}</small>
      <small>Data: ${d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : "-"}</small>

      <div class="status-buttons">
        <button class="set-status" data-id="${d.id}" data-status="urgente">Urgente</button>
        <button class="set-status" data-id="${d.id}" data-status="normal">Normal</button>
        <button class="set-status" data-id="${d.id}" data-status="resolvido">Resolvido</button>
      </div>

      <button data-id="${d.id}" class="remover">Remover</button>
    `;

    container.appendChild(div);

    // Marcar como visualizada
    if (isNew) {
      updateDoc(doc(db, "denuncias", d.id), { viewed: true, viewedAt: serverTimestamp() });
    }
  });

  // Atualizar contadores
  totalSpan.textContent = denuncias.length;
  novasSpan.textContent = novasCount;

  // Botões remover
  container.querySelectorAll(".remover").forEach(btn => {
    btn.addEventListener("click", async () => {
      await removerDenuncia(btn.dataset.id);
      listarDenuncias((data) => {
        todasDenuncias = data;
        carregarDenuncias(data);
        atualizarGraficos(data);
      });
    });
  });

  // Botões status
  container.querySelectorAll(".set-status").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const status = btn.dataset.status;
      await updateDoc(doc(db, "denuncias", id), { status });
      listarDenuncias((data) => {
        todasDenuncias = data;
        carregarDenuncias(data);
      });
    });
  });

  atualizarGraficos(denuncias);
}

// Filtros
function aplicarFiltros() {
  let filtradas = [...todasDenuncias];
  const author = filterAuthor.value.trim().toLowerCase();
  const date = filterDate.value;

  if (author) filtradas = filtradas.filter(d => d.user.toLowerCase().includes(author));
  if (date) filtradas = filtradas.filter(d => d.createdAt?.toDate && d.createdAt.toDate().toISOString().split("T")[0] === date);

  carregarDenuncias(filtradas);
}

applyFilter.addEventListener("click", aplicarFiltros);
clearFilter.addEventListener("click", () => {
  filterAuthor.value = "";
  filterDate.value = "";
  carregarDenuncias(todasDenuncias);
});

// Gráficos
function atualizarGraficos(denuncias) {
  // Barras: denúncias por usuário
  const usuarios = {};
  denuncias.forEach(d => usuarios[d.user] = (usuarios[d.user] || 0) + 1);
  const barCtx = document.getElementById("bar-chart").getContext("2d");
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: Object.keys(usuarios),
      datasets: [{
        label: "Denúncias por usuário",
        data: Object.values(usuarios),
        backgroundColor: "#0077cc"
      }]
    },
    options: { responsive: true }
  });

  // Pizza: novas vs visualizadas
  const novas = denuncias.filter(d => !d.viewed).length;
  const antigas = denuncias.length - novas;
  const pieCtx = document.getElementById("pie-chart").getContext("2d");
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Novas", "Visualizadas"],
      datasets: [{
        data: [novas, antigas],
        backgroundColor: ["#ffdd59", "#28a745"]
      }]
    },
    options: { responsive: true }
  });
}

// Controle de acesso admin
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "login.html";

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    alert("Acesso negado! Você não é administrador.");
    return window.location.href = "index.html";
  }

  listarDenuncias((denuncias) => {
    todasDenuncias = denuncias;
    carregarDenuncias(denuncias);
  });

  if (logoutBtn) logoutBtn.style.display = "inline";
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "index.html";
  });
}
