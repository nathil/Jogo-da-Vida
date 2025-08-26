let interface = null;
function setup() {
  const canvasEl = document.getElementById("tabuleiro");
  interface = new UI(500, canvasEl);
  interface.jogo.tabela.inserirCelula(0, 0, 1);
}

function mouseClicked() {
  if (interface.estaNaTela(createVector(mouseX, mouseY))) interface.trocarEstadoCelula(createVector(mouseX, mouseY));
}

function mouseWheel(e) {
  interface.definirZoom(interface.zoomAtual + (e.delta < 0 ? 0.1 : -0.1));
}

function draw() {
  blendMode(BLEND);
  background(0); 
  interface.desenhar();

  if (mouseIsPressed && mouseButton == "right" && interface.estaNaTela(createVector(mouseX, mouseY))) interface.moverTabela(createVector(movedX, movedY));
  frameRate(60);
}