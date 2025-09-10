// Script principal do jogo da vida
let interface = null;

// Flags de controle da interface
let sobreBotao = false;
let executando = false;
let acelerado = false;
let escrevendo = true;
let mostrarDebug = false;
let debugIn = null;
const debugEl = $("#debug-log");

let mostrarMenu = false;

function debugLog() {
  let log = "";

  log += `fps: ${frameRate().toFixed(1)}\n`;
  log += `tamanho: ${interface?.jogo.tamanho}x${interface?.jogo.tamanho}\n`;
  log += `nós: ${Math.pow(interface?.jogo.tamanho, 2)}\n`
  log += `memória: ${interface?.jogo.tamanhoReal}\n`;
  if (interface.estaNaTela(createVector(mouseX, mouseY))) {
    const posicaoPlano = interface.telaParaPlano(createVector(mouseX, mouseY));
    log += `posição: (${posicaoPlano.x}, ${posicaoPlano.y})\n`;
  } else {
    log += 'posição: fora da tela\n';
  }
  log += `zoom: ${interface?.zoomAtual.toFixed(2)} (escala: ${interface?.escala.toFixed(2)})\n`;
  
  
  debugEl.html(log);
}

function setup() {
  const rotaAtual = window.location.pathname.split("/").pop();
  
  const canvasEl = document.getElementById("tabuleiro");
  interface = new Interface(500, canvasEl, rotaAtual === "jogo.html" ? Padrao : HashLife);
  interface.jogo.inserirCelula(0, 0, 1);
}

function mousePressed() {
  const modal = document.getElementById('search-modal');
  if (modal && modal.classList.contains('show')) return;
  
  const posicao = createVector(mouseX, mouseY)
  if (!mouseIsPressed || sobreBotao || !interface.estaNaTela(posicao)) return;

  if (mouseButton == "left") {
    const posicaoPlano = interface.telaParaPlano(posicao);
    interface.jogo.inserirCelula(posicaoPlano.x, posicaoPlano.y, escrevendo ? 1 : 0);
  }
}

function mouseDragged() {
  const modal = document.getElementById('search-modal');
  if (modal && modal.classList.contains('show')) return;

  const posicao = createVector(mouseX, mouseY)
  if (!mouseIsPressed || sobreBotao || !interface.estaNaTela(posicao)) return;

  if (mouseButton == "left") {
    const posicaoFinal = interface.telaParaPlano(posicao);
    const posicaoInicial = interface.telaParaPlano(createVector(mouseX - movedX, mouseY - movedY));

    const delta = p5.Vector.sub(posicaoFinal, posicaoInicial);
    const passos = Math.ceil(delta.mag());

    if (passos === 0) {
      interface.jogo.inserirCelula(posicaoFinal.x, posicaoFinal.y, escrevendo ? 1 : 0);
      return;
    }

    const passo = delta.div(passos);
    let ponto = posicaoInicial.copy();

    for (let i = 0; i <= passos; i++) {
      interface.jogo.inserirCelula(round(ponto.x), round(ponto.y), escrevendo ? 1 : 0);
      ponto.add(passo);
    }
  } else if (mouseButton == "right") {
    interface.moverPlano(createVector(movedX, movedY));
  }
} 

function mouseWheel(e) {
  const modal = document.getElementById('search-modal');
  if (modal && modal.classList.contains('show')) return;
  
  if (interface.estaNaTela(createVector(mouseX, mouseY))) {
    interface.definirZoom(interface.zoomAtual + (e.delta < 0 ? 0.1 : -0.1));
  }
}

function draw() {
  blendMode(BLEND);
  background(0); 
  interface.desenhar();
  
  frameRate(60);
}

$(".game-button").on("mousedown", () => sobreBotao = true);
$(".game-button").on("mouseleave", () => sobreBotao = false);

$("#restore-button").click(() => {
  interface.redefinirPosicao();
});

$("#zoom-in-button").click(() => {
  interface.definirZoom(interface.zoomAtual + 0.1, true, false);
});

$("#zoom-out-button").click(() => {
  interface.definirZoom(interface.zoomAtual - 0.1, true, false);
});

$("#play-pause-button").click(() => {
  const botaoEl = $("#play-pause-button");
  if (!executando) {
    executando = true;
    interface.iniciar();
    botaoEl.removeClass("bi-play");
    botaoEl.addClass("bi-pause");
  } else {
    executando = false;
    interface.parar();
    botaoEl.removeClass("bi-pause");
    botaoEl.addClass("bi-play");
  }
});

$("#fast-button").click(() => {
  const BotaoEl = $("#fast-button");
  if (!acelerado) {
    acelerado = true;
    interface.intervalo = 10;
    BotaoEl.removeClass("bi-fast-forward");
    BotaoEl.addClass("bi-fast-forward-fill");
  } else {
    acelerado = false;
    interface.intervalo = 150;
    BotaoEl.removeClass("bi-fast-forward-fill");
    BotaoEl.addClass("bi-fast-forward");
  }
});

$("#skip-button").click(() => {
  if (executando) return;
  interface.jogo.atualizar();
});

$("#write-erase-button").click(() => {
  const botaoEl = $("#write-erase-button");
  if (escrevendo) {
    escrevendo = false;
    botaoEl.removeClass("bi-pencil");
    botaoEl.addClass("bi-eraser");
  } else {
    escrevendo = true;
    botaoEl.removeClass("bi-eraser");
    botaoEl.addClass("bi-pencil");
  }
});

$("#reset-button").click(() => {
  interface.redefinirPlano();
});

$("#save-button").click(() => {
  interface.salvarTela();
});

$("#debug-button").click(() => {
  const botaoEl = $("#debug-button");
  if (!mostrarDebug) {
    mostrarDebug = true;
    botaoEl.removeClass("bi-bug");
    botaoEl.addClass("bi-bug-fill");
    debugEl.show();
    debugIn = setInterval(debugLog, 100);
  } else {
    mostrarDebug = false;
    botaoEl.removeClass("bi-bug-fill");
    botaoEl.addClass("bi-bug");
    debugEl.hide();
    clearInterval(debugIn);
    debugIn = null;
  }
});

$("#collapse-button").click(() => {
  const botaoEl = $("#collapse-button");
  const menuEl = $("#collapse-menu");
  const menu = new bootstrap.Collapse('#collapse-menu', {
    toggle: false
  });

  if (menuEl.hasClass("collapsing")) return;

  if (!mostrarMenu) {
    mostrarMenu = true;
    menu.show();
    botaoEl.removeClass("bi-eye");
    botaoEl.addClass("bi-eye-slash");
  } else {
    mostrarMenu = false;
    menu.hide();
    botaoEl.removeClass("bi-eye-slash");
    botaoEl.addClass("bi-eye");
  }
});


$("#search-input").on("input", () => {
  const query = $("#search-input").val().toLowerCase();
  const resultsEl = $("#search-results");
  const template = document.getElementById("search-result-template");

  resultsEl.empty();

  if (query.length === 0) return;

  const results = interface.buscarPadroes(query);

  if (results.length === 0) {
    resultsEl.append("<p>Nenhum padrão encontrado.</p>");
    return;
  } 

  for (const padrao of results) {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".card-title").textContent = padrao.name;
    clone.querySelector(".select-pattern-button").setAttribute("onclick", `interface.selecionarPadrao('${padrao.filename}')`);
    resultsEl.append(clone);
  }
});