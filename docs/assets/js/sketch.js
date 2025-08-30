let interface = null;
function setup() {
  const canvasEl = document.getElementById("tabuleiro");
  interface = new UI(500, canvasEl);
  interface.jogo.tabela.inserirCelula(0, 0, 1);
}

function mouseWheel(e) {
  interface.definirZoom(interface.zoomAtual + (e.delta < 0 ? 0.1 : -0.1));
}

function draw() {
  blendMode(BLEND);
  background(0); 
  interface.desenhar();

  const posicao = createVector(mouseX, mouseY)
  if (mouseIsPressed && interface.estaNaTela(posicao)) {
    const posicaoTabela = interface.telaParaTabela(posicao);

    if (mouseButton == "left" || mouseButton == "right") {
      interface.jogo.tabela.inserirCelula(posicaoTabela.x, posicaoTabela.y, mouseButton == "left" ? 1 : 0);
    } else if (mouseButton == "center") {
      interface.moverTabela(createVector(movedX, movedY));
    }
  }
  
  frameRate(60);
}