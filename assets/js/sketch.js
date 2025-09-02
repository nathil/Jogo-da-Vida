let interface = null;
let modoPincel = "escrever";

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