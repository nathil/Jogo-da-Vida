class UI {
    constructor(tamanho, canvas) {
        createCanvas(tamanho, tamanho, canvas);
        canvas.addEventListener("wheel", (e) => e.preventDefault());
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        
        this.canvas = canvas;

        this.deslocamento = createVector(0, 0);

        this.tamanho = createVector(tamanho, tamanho);
        this.meio = this.tamanho.copy().div(2);

        this.zoomMin = 1;
        this.zoomMax = 10;
        this.zoomAtual = 1;
        this.escala = 1;
        this.definirZoom(3.33, false); // Definindo o zoom inicial (Aproximadamente escala de 1 -> 10);

        const topoEsquerdo = this.telaParaTabela(createVector(0, 0), false);
        const baseDireita = this.telaParaTabela(this.tamanho.copy(), false);
        const comprimentoTabela = baseDireita.x - topoEsquerdo.x;

        this.jogo = new Jogo(comprimentoTabela);
    }

    estaNaTela(posicao) {
        return posicao.x >= 0 && posicao.x <= this.tamanho.x && posicao.y >= 0 && posicao.y <= this.tamanho.y;
    }

    tabelaParaTela(posicao) {
        posicao.mult(this.escala);
        posicao.add(this.meio);
        posicao.add(this.deslocamento);
        return posicao;
    }

    telaParaTabela(posicao, arredondar=true) {
        posicao.sub(this.deslocamento);
        posicao.sub(this.meio);
        posicao.div(this.escala);

        if (arredondar) posicao.set(floor(posicao.x), floor(posicao.y));

        return posicao;
    }

    trocarEstadoCelula(posicao) {
        const posicaoTabela = this.telaParaTabela(posicao);
        const celula = this.jogo?.tabela.obterCelula(posicaoTabela.x, posicaoTabela.y);
        this.jogo?.tabela.inserirCelula(posicaoTabela.x, posicaoTabela.y, celula ? 0 : 1);
    }
    
    moverTabela(distancia) {
        this.deslocamento.add(distancia);
    }
    
    definirZoom(novoZoom, compensar=true) {
        const posicaoMouse = createVector(mouseX, mouseY);
        const referencia = this.estaNaTela(posicaoMouse) ? posicaoMouse : this.meio.copy();
        const referenciaNaTabela = this.telaParaTabela(referencia.copy(), false);
        
        this.zoomAtual = constrain(novoZoom, this.zoomMin, this.zoomMax);
        this.escala = pow(2, this.zoomAtual);
        
        if (compensar) {
            const referenciaNaTela = this.tabelaParaTela(referenciaNaTabela);
            this.moverTabela(referencia.sub(referenciaNaTela));
        }
    }
    
    redefinirTabela() {
        this.deslocamento.set(0, 0);
        this.definirZoom(3.33, false);
    }
    
    desenhar() {
        background(0);

        const topoEsquerdo = this.telaParaTabela(createVector(0, 0));
        const baseDireita = this.telaParaTabela(this.tamanho.copy());

        const xInicio = topoEsquerdo.x;
        const yInicio = topoEsquerdo.y;
        const xFim = baseDireita.x;
        const yFim = baseDireita.y;

        // console.log(`Desenhando de (${xInicio}, ${yInicio}) a (${xFim}, ${yFim})`);

        fill("white");
        blendMode(this.escala > 12 ? BLEND : ADD); // Remove as bordas para escalas menores

        for (let i = xInicio; i <= xFim; i++) {
            for (let j = yInicio; j <= yFim; j++) {
                if (this.jogo?.tabela.obterCelula(i, j)) {
                    const posicao = this.tabelaParaTela(createVector(i, j));
                    square(posicao.x, posicao.y, this.escala);
                }
            }
        }
    }

    salvarTela() {
        const imageDataURL = this.canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = imageDataURL;
        a.download = 'my_canvas_image.png'; // Specify the desired filename
        document.body.appendChild(a); // Temporarily add the link to the DOM
        a.click(); // Programmatically click the link to trigger download
        document.body.removeChild(a); // Remove the link after clicking
    }

    iniciarJogo(intervalo=200) {
        this.intervaloId = setInterval(() => {
            this.jogo?.atualiza();
        }, intervalo);
    }

    pararJogo() {
        clearInterval(this.intervaloId);
    }
}