let interface = null;
let modoPincel = "escrever";
let estado = "pausado";
let debugIn = null;
const debugEl = $("#debug-log");

function debugLog() {
  let log = "";

  log += `fps: ${frameRate().toFixed(1)}\n`;
  log += `tamanho: ${interface?.jogo.tabela.tamanho}x${interface?.jogo.tabela.tamanho}\n`;
  log += `quantidade: ${Math.pow(interface?.jogo.tabela.tamanho, 2)}`
  
  debugEl.html(log);
}

function setup() {
  const canvasEl = document.getElementById("tabuleiro");
  interface = new UI(500, canvasEl);
  interface.jogo.tabela.inserirCelula(0, 0, 1);
}

function mouseWheel(e) {
  if (interface.estaNaTela(createVector(mouseX, mouseY))) {
    interface.definirZoom(interface.zoomAtual + (e.delta < 0 ? 0.1 : -0.1));
  }
}

function draw() {
  blendMode(BLEND);
  background(0); 
  interface.desenhar();

  const posicao = createVector(mouseX, mouseY)
  if (mouseIsPressed && interface.estaNaTela(posicao)) {
    const posicaoTabela = interface.telaParaTabela(posicao);

    if (mouseButton == "left") {
      interface.jogo.tabela.inserirCelula(posicaoTabela.x, posicaoTabela.y, modoPincel == "escrever" ? 1 : 0);
    } else if (mouseButton == "right") {
      interface.moverTabela(createVector(movedX, movedY));
    }
  }
  
  frameRate(60);
}

$("#play-pause-fast-button").click(() => {
  const botaoEl = $("#play-pause-fast-button");
  if (estado === "pausado") {
    estado = "executando";
    interface.iniciarJogo(150);
    botaoEl.removeClass("bi-pause bi-fast-forward");
    botaoEl.addClass("bi-play");
  } else if (estado === "executando") {
    estado = "acelerado";
    interface.pararJogo();
    interface.iniciarJogo(10);
    botaoEl.removeClass("bi-play bi-pause");
    botaoEl.addClass("bi-fast-forward");
  } else {
    estado = "pausado";
    interface.pararJogo();
    botaoEl.removeClass("bi-play bi-fast-forward");
    botaoEl.addClass("bi-pause");
  }
});

$("#write-erase-button").click(() => {
  const botaoEl = $("#write-erase-button");
  if (modoPincel === "escrever") {
    modoPincel = "apagar";
    botaoEl.removeClass("bi-pencil");
    botaoEl.addClass("bi-eraser");
  } else {
    modoPincel = "escrever";
    botaoEl.removeClass("bi-eraser");
    botaoEl.addClass("bi-pencil");
  }
});

$("#redefine-button").click(() => {
  interface.redefinirTabela();
});

$("#save-button").click(() => {
  interface.salvarTela();
});

$("#debug-button").click(() => {
  if (debugIn === null) {
    debugIn = setInterval(debugLog, 100);
    debugEl.show();
  } else {
    clearInterval(debugIn);
    debugIn = null;
    debugEl.hide();
  }
});

$("#zoom-in-button").click(() => {
  interface.definirZoom(interface.zoomAtual + 0.1);
});

$("#zoom-out-button").click(() => {
  interface.definirZoom(interface.zoomAtual - 0.1);
});
