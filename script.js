"use strict";
const dados = window.NEXASOMA_DADOS;
const estado = document.getElementById('estado');
const categoria = document.getElementById('categoria');
const indicador = document.getElementById('indicador');
const grafico = document.getElementById('grafico');
const avisoRegiao = document.getElementById('aviso-regiao');
const priorizar = document.getElementById('priorizar');
const statusAcompanhamento = document.getElementById('status-acompanhamento');

function adicionarElemento(tag, classe, texto, parent) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  if (parent) parent.appendChild(el);
  return el;
}
function atualizarIndicadores() {
  const conjunto = dados.indicators.filter(i => categoria.value === 'todos' || i.group === categoria.value);
  indicador.replaceChildren();
  conjunto.forEach(i => {
    const opcao = document.createElement('option');
    opcao.value = i.id; opcao.textContent = i.title;
    indicador.appendChild(opcao);
  });
  renderizarGrafico();
}
function renderizarGrafico() {
  const item = dados.indicators.find(i => i.id === indicador.value);
  grafico.replaceChildren();
  if (!item) return;
  document.getElementById('titulo-grafico').textContent = item.title;
  document.getElementById('pergunta-pesquisa').textContent = item.question;
  const container = adicionarElemento('div', 'grafico-barras', undefined, grafico);
  for (const resposta of item.values) {
    const pct = resposta.count / dados.sample * 100;
    const linha = adicionarElemento('div', 'barra-item', undefined, container);
    const topo = adicionarElemento('div', 'barra-topo', undefined, linha);
    adicionarElemento('span', '', resposta.label, topo);
    adicionarElemento('strong', '', `${resposta.count} (${pct.toFixed(1).replace('.', ',')}%)`, topo);
    const trilho = adicionarElemento('div', 'barra-trilho', undefined, linha);
    const preenchida = adicionarElemento('div', 'barra-preenchida', undefined, trilho);
    preenchida.style.width = `${pct}%`;
  }
  document.getElementById('fonte-dados').textContent = `Fonte: questionário Nexasoma · ${dados.dateRange} · n=${dados.sample} respostas · valores em contagem e percentual sobre a amostra; sem identificação do estado.`;
  document.getElementById('descricao-fator').textContent = `Indicador: ${item.title}. As categorias descrevem respostas fornecidas pelos participantes, sem comprovação clínica ou associação causal.`;
}
function atualizarRegiao() {
  if (!estado.value) { avisoRegiao.hidden = true; return; }
  avisoRegiao.hidden = false;
  const nome = estado.options[estado.selectedIndex].textContent;
  avisoRegiao.textContent = `Não há dados específicos de ${nome} neste questionário: a pesquisa não perguntou a localização dos respondentes. O gráfico permanece referente à amostra geral.`;
}
function atualizarNavegacao() {
  const hash = location.hash || '#home';
  document.querySelectorAll('.menu-lateral nav a').forEach(a => {
    a.classList.toggle('ativo', a.getAttribute('href') === hash);
    if (a.getAttribute('href') === hash) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}
if (dados) {
  document.getElementById('metrica-respostas').textContent = dados.sample;
  document.getElementById('metrica-indicadores').textContent = dados.indicators.length;
  categoria.addEventListener('change', atualizarIndicadores);
  indicador.addEventListener('change', renderizarGrafico);
  estado.addEventListener('change', atualizarRegiao);
  atualizarIndicadores();
} else grafico.textContent = 'Não foi possível carregar dados.js.';
priorizar.addEventListener('click', () => {
  const ativo = priorizar.getAttribute('aria-pressed') !== 'true';
  priorizar.setAttribute('aria-pressed', String(ativo));
  priorizar.textContent = ativo ? 'Remover prioridade' : 'Priorizar acompanhamento';
  statusAcompanhamento.textContent = ativo ? 'Status: acompanhamento priorizado nesta demonstração (não salvo).' : 'Status: aguardando ação.';
});
window.addEventListener('hashchange', atualizarNavegacao);
atualizarNavegacao();
