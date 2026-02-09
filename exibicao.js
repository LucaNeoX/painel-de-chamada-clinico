const STORAGE_KEYS = {
  SERVICOS: "painel_servicos",
  ULTIMA_CHAMADA: "painel_ultima_chamada",
  HISTORICO: "painel_historico"
};

const tvSenha = document.getElementById("tv-senha");
const tvServico = document.getElementById("tv-servico");
const tvFaixa = document.getElementById("tv-faixa");
const historicoLista = document.getElementById("tv-historico-lista");

function carregarHistorico() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORICO);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function carregarUltimaChamada() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ULTIMA_CHAMADA);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function formatarHora(timestamp) {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function atualizarTela() {
  const ultima = carregarUltimaChamada();
  const historico = carregarHistorico();

  if (!ultima) {
    tvSenha.textContent = "---";
    tvServico.textContent = "Nenhuma chamada ainda";
    tvFaixa.textContent = "";
  } else {
    tvSenha.textContent = ultima.senha;
    tvServico.textContent = ultima.servico;
    tvFaixa.textContent = ultima.faixa ? ultima.faixa.toUpperCase() : "";
  }

  historicoLista.innerHTML = "";

  if (historico.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma chamada registrada ainda.";
    li.style.opacity = "0.8";
    historicoLista.appendChild(li);
    return;
  }

  historico.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "tv-historico-item";

    if (index === 0) {
      li.classList.add("tv-historico-item-destaque");
    }

    const top = document.createElement("div");
    top.className = "tv-historico-top";

    const senhaEl = document.createElement("div");
    senhaEl.className = "tv-historico-senha";
    senhaEl.textContent = item.senha;

    const horaEl = document.createElement("div");
    horaEl.className = "tv-historico-hora";
    horaEl.textContent = formatarHora(item.timestamp);

    top.appendChild(senhaEl);
    top.appendChild(horaEl);

    const servicoEl = document.createElement("div");
    servicoEl.className = "tv-historico-servico";
    servicoEl.textContent = item.servico;

    li.appendChild(top);
    li.appendChild(servicoEl);

    historicoLista.appendChild(li);
  });
}

// Atualização periódica (funciona mesmo em abas diferentes)
function iniciarAtualizacaoAutomatica() {
  atualizarTela();
  setInterval(atualizarTela, 1000);
}

document.addEventListener("DOMContentLoaded", iniciarAtualizacaoAutomatica);
