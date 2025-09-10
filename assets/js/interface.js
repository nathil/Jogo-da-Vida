class Interface {
    constructor(tamanho, canvas, Implementacao) {
        createCanvas(tamanho, tamanho, canvas);
        canvas.addEventListener("wheel", (e) => e.preventDefault());
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        
        this.canvas = canvas;
        this.corCelula = "#39FF14";
        this.borragem = 10;

        this.deslocamento = createVector(0, 0);

        this.tamanho = createVector(tamanho, tamanho);
        this.meio = this.tamanho.copy().div(2);

        this.zoomMin = 1;
        this.zoomMax = 10;
        this.zoomAtual = 1;
        this.escala = 1;
        this.definirZoom(3.33, false); // Definindo o zoom inicial (Aproximadamente escala de 1 -> 10);

        const topoEsquerdo = this.telaParaPlano(createVector(0, 0), false);
        const baseDireita = this.telaParaPlano(this.tamanho.copy(), false);
        const comprimentoTabela = baseDireita.x - topoEsquerdo.x;

        this.jogo = new Implementacao(comprimentoTabela);
        this.executando = false;
        this.intervalo = 150;
    }

    estaNaTela(posicao) {
        return posicao.x >= 0 && posicao.x <= this.tamanho.x && posicao.y >= 0 && posicao.y <= this.tamanho.y;
    }

    planoParaTela(posicao) {
        posicao.mult(this.escala);
        posicao.add(this.meio);
        posicao.add(this.deslocamento);
        return posicao;
    }

    telaParaPlano(posicao, arredondar=true) {
        posicao.sub(this.deslocamento);
        posicao.sub(this.meio);
        posicao.div(this.escala);

        if (arredondar) posicao.set(floor(posicao.x), floor(posicao.y));

        return posicao;
    }

    moverPlano(distancia) {
        this.deslocamento.add(distancia);
    }
    
    definirZoom(novoZoom, compensar=true, usarPosicaoMouse=true) {
        const posicaoMouse = createVector(mouseX, mouseY);
        const referencia = this.estaNaTela(posicaoMouse) && usarPosicaoMouse ? posicaoMouse : this.meio.copy();
        const referenciaNoPlano = this.telaParaPlano(referencia.copy(), false);

        this.zoomAtual = constrain(novoZoom, this.zoomMin, this.zoomMax);
        this.escala = pow(2, this.zoomAtual);
        
        if (compensar) {
            const referenciaNaTela = this.planoParaTela(referenciaNoPlano);
            this.moverPlano(referencia.sub(referenciaNaTela));
        }
    }
    
    redefinirPosicao() {
        this.deslocamento.set(0, 0);
        this.definirZoom(3.33, false);
    }

    redefinirPlano() {
        this.jogo.limpar();
    }
    
    desenhar() {
        background(0);

        const topoEsquerdo = this.telaParaPlano(createVector(0, 0));
        const baseDireita = this.telaParaPlano(this.tamanho.copy());

        const xInicio = topoEsquerdo.x;
        const yInicio = topoEsquerdo.y;
        const xFim = baseDireita.x;
        const yFim = baseDireita.y;

        noStroke();
        fill(this.corCelula);
        blendMode(ADD);

        for (let i = xInicio; i <= xFim; i++) {
            for (let j = yInicio; j <= yFim; j++) {
                if (this.jogo.obterCelula(i, j)) {
                    const posicao = this.planoParaTela(createVector(i, j));
                    square(posicao.x, posicao.y, this.escala);
                }
            }
        }
    }

    salvarTela() {
        const imageDataURL = this.canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = imageDataURL;
        a.download = 'my_canvas_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    async atualizar() {
        if (!this.executando) return;

        if (this.jogo != null) {
            await this.jogo.atualizar();
        }

        setTimeout(() => {
            this.atualizar();
        }, this.intervalo);
    }

    iniciar() {
        if (this.executando) return;
        this.executando = true;

        this.atualizar();
    }

    parar() {
        this.executando = false;
    }
}