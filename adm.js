// Chaves usadas no localStorage para compartilhar dados entre os painéis
const STORAGE_KEYS = {
  SERVICOS: "painel_servicos",
  ULTIMA_CHAMADA: "painel_ultima_chamada",
  HISTORICO: "painel_historico",
  ATENDIMENTOS: "painel_atendimentos"
};

// Estado de edição de serviço (null = adicionando novo)
let indiceEdicaoAtual = null;

// Elementos principais
const senhaInput = document.getElementById("senha-input");
const servicoSelect = document.getElementById("servico-select");
const btnOk = document.getElementById("btn-ok");
const btnConfig = document.getElementById("btn-config");
const ultimaChamadaTexto = document.getElementById("ultima-chamada-texto");
const btnLimparHistorico = document.getElementById("btn-limpar-historico");
const historicoAdmTbody = document.getElementById("historico-adm-tbody");
const quadroColunasEl = document.getElementById("quadro-colunas");

// Modal de serviços
const modal = document.getElementById("config-modal");
const modalClose = document.getElementById("modal-close");
const servicoForm = document.getElementById("servico-form");
const servicoNomeInput = document.getElementById("servico-nome");
const servicoFaixaInput = document.getElementById("servico-faixa");
const servicoCorInput = document.getElementById("servico-cor");
const cancelarEdicaoBtn = document.getElementById("cancelar-edicao");
const servicosTbody = document.getElementById("servicos-tbody");

// Modal de alteração de status
const statusModal = document.getElementById("status-modal");
const statusModalClose = document.getElementById("status-modal-close");
const statusModalInfo = document.getElementById("status-modal-info");
const statusSelect = document.getElementById("status-select");
const statusConfirmarBtn = document.getElementById("status-confirmar");
const statusCancelarBtn = document.getElementById("status-cancelar");
let atendimentoEmEdicaoId = null;

// ---- Funções utilitárias de localStorage ----

function carregarServicos() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICOS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function salvarServicos(servicos) {
  localStorage.setItem(STORAGE_KEYS.SERVICOS, JSON.stringify(servicos));
}

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

function salvarHistorico(historico) {
  localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historico));
}

function carregarAtendimentos() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATENDIMENTOS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function salvarAtendimentos(atendimentos) {
  localStorage.setItem(STORAGE_KEYS.ATENDIMENTOS, JSON.stringify(atendimentos));
}

function formatarDataHora(timestamp) {
  const d = new Date(timestamp);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hh}:${mm}`;
}

// ---- Inicialização de serviços (exemplo padrão) ----

function inicializarServicosSeVazio() {
  // Sistema inicia zerado - sem serviços padrão
  // Os serviços devem ser cadastrados manualmente pelo usuário
  return;
}

// ---- Atualização de UI ----

function atualizarSelectServicos() {
  const servicos = carregarServicos();
  servicoSelect.innerHTML = "";

  if (servicos.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nenhum serviço cadastrado";
    servicoSelect.appendChild(opt);
    return;
  }

  servicos.forEach((servico, index) => {
    const opt = document.createElement("option");
    opt.value = index.toString();
    opt.textContent = `${servico.faixa} – ${servico.nome}`;
    servicoSelect.appendChild(opt);
  });
}

function atualizarTabelaServicos() {
  const servicos = carregarServicos();
  servicosTbody.innerHTML = "";

  if (servicos.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = "Nenhum serviço cadastrado.";
    td.style.textAlign = "center";
    td.style.color = "#6b7280";
    tr.appendChild(td);
    servicosTbody.appendChild(tr);
    return;
  }

  servicos.forEach((servico, index) => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = servico.nome;

    const tdFaixa = document.createElement("td");
    tdFaixa.textContent = servico.faixa;

    const tdCor = document.createElement("td");
    const corBadge = document.createElement("span");
    corBadge.style.display = "inline-block";
    corBadge.style.width = "16px";
    corBadge.style.height = "16px";
    corBadge.style.borderRadius = "999px";
    corBadge.style.border = "1px solid rgba(15,23,42,0.18)";
    corBadge.style.backgroundColor = servico.cor || "#9ca3af";
    tdCor.appendChild(corBadge);

    const tdAcoes = document.createElement("td");
    const divAcoes = document.createElement("div");
    divAcoes.className = "acoes-servico";

    const btnEditar = document.createElement("button");
    btnEditar.className = "btn btn-secondary";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => editarServico(index));

    const btnExcluir = document.createElement("button");
    btnExcluir.className = "btn btn-secondary";
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => excluirServico(index));

    divAcoes.appendChild(btnEditar);
    divAcoes.appendChild(btnExcluir);
    tdAcoes.appendChild(divAcoes);

    tr.appendChild(tdNome);
    tr.appendChild(tdFaixa);
    tr.appendChild(tdCor);
    tr.appendChild(tdAcoes);

    servicosTbody.appendChild(tr);
  });
}

function atualizarUltimaChamadaTexto() {
  const ultima = localStorage.getItem(STORAGE_KEYS.ULTIMA_CHAMADA);
  if (!ultima) {
    ultimaChamadaTexto.textContent = "Nenhuma chamada ainda.";
    return;
  }

  try {
    const dados = JSON.parse(ultima);
    ultimaChamadaTexto.textContent = `Senha ${dados.senha} (${dados.faixa} – ${dados.servico})`;
  } catch {
    ultimaChamadaTexto.textContent = "Nenhuma chamada ainda.";
  }
}

function atualizarHistoricoAdm() {
  const historico = carregarHistorico();
  historicoAdmTbody.innerHTML = "";

  if (historico.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Nenhuma chamada registrada ainda.";
    td.style.textAlign = "center";
    td.style.color = "#6b7280";
    tr.appendChild(td);
    historicoAdmTbody.appendChild(tr);
    return;
  }

  historico.forEach((item) => {
    const tr = document.createElement("tr");

    const tdSenha = document.createElement("td");
    tdSenha.textContent = item.senha;

    const tdServico = document.createElement("td");
    tdServico.textContent = item.servico;

    const tdFaixa = document.createElement("td");
    tdFaixa.textContent = item.faixa;

    const tdData = document.createElement("td");
    tdData.textContent = formatarDataHora(item.timestamp);

    tr.appendChild(tdSenha);
    tr.appendChild(tdServico);
    tr.appendChild(tdFaixa);
    tr.appendChild(tdData);

    historicoAdmTbody.appendChild(tr);
  });
}

// ---- Ações de serviços ----

function editarServico(index) {
  const servicos = carregarServicos();
  const servico = servicos[index];
  if (!servico) return;

  indiceEdicaoAtual = index;
  servicoNomeInput.value = servico.nome;
  servicoFaixaInput.value = servico.faixa;
  servicoCorInput.value = servico.cor || "#facc15";
  cancelarEdicaoBtn.classList.remove("hidden");
}

function excluirServico(index) {
  const servicos = carregarServicos();
  const servico = servicos[index];
  if (!servico) return;

  const confirma = window.confirm(
    `Tem certeza que deseja excluir o serviço "${servico.nome}"?\n\nTodas as senhas da faixa "${servico.faixa}" serão removidas do quadro de atendimento.`
  );
  if (!confirma) return;

  const faixaExcluida = servico.faixa;

  // Remove o serviço
  servicos.splice(index, 1);
  salvarServicos(servicos);
  atualizarSelectServicos();
  atualizarTabelaServicos();

  // Remove todos os atendimentos dessa faixa do quadro
  const atendimentos = carregarAtendimentos();
  const atendimentosFiltrados = atendimentos.filter(
    (a) => a.faixa !== faixaExcluida
  );
  salvarAtendimentos(atendimentosFiltrados);
  atualizarQuadroAtendimentos();

  // Se estava editando este índice, cancela edição
  if (indiceEdicaoAtual === index) {
    resetarFormularioServico();
  }
}

function resetarFormularioServico() {
  indiceEdicaoAtual = null;
  servicoNomeInput.value = "";
  servicoFaixaInput.value = "";
  servicoCorInput.value = "#facc15";
  cancelarEdicaoBtn.classList.add("hidden");
}

// ---- Quadro de atendimento (KANBAN simples) ----

function obterFaixasComCor() {
  const servicos = carregarServicos();
  const mapa = new Map();

  servicos.forEach((s) => {
    if (!s.faixa) return;
    if (!mapa.has(s.faixa)) {
      mapa.set(s.faixa, {
        nome: s.faixa,
        cor: s.cor || "#9ca3af"
      });
    }
  });

  return Array.from(mapa.values());
}

function atualizarQuadroAtendimentos() {
  const faixas = obterFaixasComCor();
  const atendimentos = carregarAtendimentos();

  quadroColunasEl.innerHTML = "";

  if (faixas.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "Cadastre serviços e faixas para ver o quadro de atendimento.";
    msg.style.fontSize = "0.85rem";
    msg.style.color = "#6b7280";
    quadroColunasEl.appendChild(msg);
    return;
  }

  faixas.forEach((faixaInfo) => {
    const coluna = document.createElement("div");
    coluna.className = "quadro-coluna";

    const header = document.createElement("div");
    header.className = "quadro-coluna-header";

    const titulo = document.createElement("div");
    titulo.className = "quadro-coluna-titulo";
    titulo.textContent = faixaInfo.nome;

    const corEl = document.createElement("div");
    corEl.className = "quadro-coluna-cor";
    corEl.style.backgroundColor = faixaInfo.cor;

    header.appendChild(titulo);
    header.appendChild(corEl);

    const lista = document.createElement("div");
    lista.className = "quadro-coluna-lista";

    const itensDaFaixa = atendimentos.filter(
      (a) => a.faixa === faixaInfo.nome
    );

    if (itensDaFaixa.length === 0) {
      const vazio = document.createElement("div");
      vazio.style.fontSize = "0.8rem";
      vazio.style.color = "#9ca3af";
      vazio.textContent = "Sem senhas aqui.";
      lista.appendChild(vazio);
    } else {
      itensDaFaixa.forEach((item) => {
        const card = document.createElement("div");
        card.className = "quadro-card";
        card.dataset.id = item.id;
        card.style.borderLeftColor = item.cor || faixaInfo.cor;

        const senhaEl = document.createElement("div");
        senhaEl.className = "quadro-card-senha";
        senhaEl.textContent = item.senha;

        const servicoEl = document.createElement("div");
        servicoEl.className = "quadro-card-servico";
        servicoEl.textContent = item.servico;

        card.appendChild(senhaEl);
        card.appendChild(servicoEl);

        card.addEventListener("click", () => {
          abrirStatusModal(item.id);
        });

        lista.appendChild(card);
      });
    }

    coluna.appendChild(header);
    coluna.appendChild(lista);
    quadroColunasEl.appendChild(coluna);
  });
}

function abrirStatusModal(atendimentoId) {
  const atendimentos = carregarAtendimentos();
  const index = atendimentos.findIndex((a) => a.id === atendimentoId);
  if (index === -1) return;

  const faixas = obterFaixasComCor();
  if (faixas.length === 0) return;

  const atual = atendimentos[index];

  atendimentoEmEdicaoId = atendimentoId;

  statusModalInfo.textContent = `Senha ${atual.senha} – ${atual.servico}`;

  statusSelect.innerHTML = "";
  faixas.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.nome;
    opt.textContent = f.nome;
    if (f.nome === atual.faixa) opt.selected = true;
    statusSelect.appendChild(opt);
  });

  statusModal.classList.remove("hidden");
}

function confirmarStatusModal() {
  if (!atendimentoEmEdicaoId) {
    statusModal.classList.add("hidden");
    return;
  }

  const novaFaixaNome = statusSelect.value;
  const faixas = obterFaixasComCor();
  const faixaNova = faixas.find((f) => f.nome === novaFaixaNome);
  if (!faixaNova) {
    statusModal.classList.add("hidden");
    return;
  }

  const atendimentos = carregarAtendimentos();
  const index = atendimentos.findIndex((a) => a.id === atendimentoEmEdicaoId);
  if (index === -1) {
    statusModal.classList.add("hidden");
    return;
  }

  atendimentos[index] = {
    ...atendimentos[index],
    faixa: faixaNova.nome,
    cor: faixaNova.cor
  };

  salvarAtendimentos(atendimentos);
  atualizarQuadroAtendimentos();
  atendimentoEmEdicaoId = null;
  statusModal.classList.add("hidden");
}

// ---- Envio de chamada ----

function enviarChamada() {
  const senha = senhaInput.value.trim();
  const servicos = carregarServicos();
  const indiceServico = parseInt(servicoSelect.value, 10);
  const servicoSelecionado = servicos[indiceServico];

  if (!senha) {
    alert("Digite a senha que deseja chamar.");
    senhaInput.focus();
    return;
  }

  if (!servicoSelecionado) {
    alert("Selecione um serviço válido.");
    servicoSelect.focus();
    return;
  }

  const registro = {
    senha,
    servico: servicoSelecionado.nome,
    faixa: servicoSelecionado.faixa,
    cor: servicoSelecionado.cor || "#9ca3af",
    timestamp: Date.now()
  };

  // Atualiza última chamada
  localStorage.setItem(STORAGE_KEYS.ULTIMA_CHAMADA, JSON.stringify(registro));

  // Atualiza histórico: insere no início
  const historico = carregarHistorico();
  historico.unshift(registro);
  // Mantém, por exemplo, apenas as últimas 50 chamadas
  const historicoLimitado = historico.slice(0, 50);
  salvarHistorico(historicoLimitado);

  atualizarUltimaChamadaTexto();
  atualizarHistoricoAdm();

  // Atualiza quadro de atendimento
  const atendimentos = carregarAtendimentos();
  const existenteIndex = atendimentos.findIndex(
    (a) => a.senha === registro.senha && a.servico === registro.servico
  );

  if (existenteIndex >= 0) {
    atendimentos[existenteIndex] = {
      ...atendimentos[existenteIndex],
      faixa: registro.faixa,
      cor: registro.cor,
      timestamp: registro.timestamp
    };
  } else {
    const novoAtendimento = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      senha: registro.senha,
      servico: registro.servico,
      faixa: registro.faixa,
      cor: registro.cor,
      timestamp: registro.timestamp
    };
    atendimentos.push(novoAtendimento);
  }

  salvarAtendimentos(atendimentos);
  atualizarQuadroAtendimentos();

  // Limpa campo de senha para próxima chamada
  senhaInput.value = "";
  senhaInput.focus();
}

// ---- Controle de Modal ----

function abrirModal() {
  modal.classList.remove("hidden");
}

function fecharModal() {
  modal.classList.add("hidden");
  resetarFormularioServico();
}

// ---- Listeners ----

btnOk.addEventListener("click", enviarChamada);

senhaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    enviarChamada();
  }
});

btnConfig.addEventListener("click", abrirModal);
modalClose.addEventListener("click", fecharModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    fecharModal();
  }
});

statusModal.addEventListener("click", (event) => {
  if (event.target === statusModal) {
    statusModal.classList.add("hidden");
    atendimentoEmEdicaoId = null;
  }
});

servicoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nome = servicoNomeInput.value.trim();
  const faixa = servicoFaixaInput.value.trim();
  const cor = servicoCorInput.value || "#facc15";

  if (!nome || !faixa) {
    alert("Preencha o nome e a faixa do serviço.");
    return;
  }

  const servicos = carregarServicos();

  if (indiceEdicaoAtual !== null) {
    // Editando serviço existente
    servicos[indiceEdicaoAtual] = { nome, faixa, cor };
  } else {
    // Novo serviço
    servicos.push({ nome, faixa, cor });
  }

  salvarServicos(servicos);
  atualizarSelectServicos();
  atualizarTabelaServicos();
  resetarFormularioServico();
});

cancelarEdicaoBtn.addEventListener("click", resetarFormularioServico);

statusModalClose.addEventListener("click", () => {
  statusModal.classList.add("hidden");
  atendimentoEmEdicaoId = null;
});

statusCancelarBtn.addEventListener("click", () => {
  statusModal.classList.add("hidden");
  atendimentoEmEdicaoId = null;
});

statusConfirmarBtn.addEventListener("click", confirmarStatusModal);

btnLimparHistorico.addEventListener("click", () => {
  const confirma = window.confirm(
    "Tem certeza que deseja apagar todo o histórico de chamadas? Essa ação não pode ser desfeita.\n\nOs pacientes das colunas também serão removidos."
  );
  if (!confirma) return;

  localStorage.removeItem(STORAGE_KEYS.HISTORICO);
  localStorage.removeItem(STORAGE_KEYS.ULTIMA_CHAMADA);
  localStorage.removeItem(STORAGE_KEYS.ATENDIMENTOS);
  atualizarUltimaChamadaTexto();
  atualizarHistoricoAdm();
  atualizarQuadroAtendimentos();
});

// ---- Inicialização ----

function inicializarAdm() {
  // Sistema inicia zerado - sem inicialização automática
  atualizarSelectServicos();
  atualizarTabelaServicos();
  atualizarUltimaChamadaTexto();
  atualizarHistoricoAdm();
  atualizarQuadroAtendimentos();
}

document.addEventListener("DOMContentLoaded", inicializarAdm);
