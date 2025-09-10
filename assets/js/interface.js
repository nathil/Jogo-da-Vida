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

        this.zoomMin = 0;
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

        this.carregarPadroes();
    }

    carregarPadroes() {
        fetch('padroes/index.txt')
            .then(response => response.text())
            .then(data => {
                this.padroes = this.parsePadroes(data);
            })
            .catch(error => {
                console.error('Erro ao carregar padrões:', error);
                this.padroes = {};
            });
    }

    parsePadroes(data) {
        const filenames = data.split('\n');
        const padroes = [];

        for (const filename of filenames) {
            padroes.push({
                filename: filename.trim(),
                name: filename.replace('.rle', '').replace(/_/g, ' '),
            });
        }
        
        return padroes;
    }

    buscarPadroes(termo) {
        if (!this.padroes) return [];

        termo = termo.toLowerCase();
        return Object.values(this.padroes)
            .filter(padrao => padrao.name.toLowerCase().includes(termo))
            .slice(0, 15);
    }

    selecionarPadrao(arquivo) {
        fetch(`padroes/${arquivo}`)
            .then(response => response.text())
            .then(data => {
                this.parar();
                this.semeiar(data);
                this.redefinirPosicao();
                const modal = bootstrap.Modal.getInstance(document.getElementById('search-modal'));
                modal.hide();
            })
            .catch(error => {
                console.error('Erro ao carregar o padrão:', error);
            });
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

    semeiar(rle) {
        const linhas = rle.trim().split("\n").filter(linha => !linha.startsWith("#")); 

        const cabecalho = linhas[0];
        const match = cabecalho.match(/x\s*=\s*(\d+),\s*y\s*=\s*(\d+)/);
        if (!match) throw new Error("Cabeçalho RLE inválido.");

        const largura = parseInt(match[1], 10);
        const altura = parseInt(match[2], 10);

        this.redefinirPlano();

        const cadeia = linhas.slice(1).join("").replace(/\s+/g, '');
        let contador = 0;

        let bufferQuantidade = "";
        let x = -Math.floor(largura / 2);
        let y = -Math.floor(altura / 2);
        let ch = '';

        const numeros = "0123456789";
        const letras = "bo";

        do {
            ch = cadeia.charAt(contador);

            if (numeros.includes(ch)) {
                bufferQuantidade += ch;
            } else if (letras.includes(ch)) {
                const quantidade = bufferQuantidade ? parseInt(bufferQuantidade, 10) : 1;
                bufferQuantidade = "";

                const valor = ch === 'b' ? 0 : 1;
                for (let i = 0; i < quantidade; i++) {
                    this.jogo.inserirCelula(x, y, valor);
                    x++;
                }
            } else if (ch === '$') {
                const quantidade = bufferQuantidade ? parseInt(bufferQuantidade, 10) : 1;
                bufferQuantidade = "";

                y += quantidade;
                x = -Math.floor(largura / 2);
            } else if (ch === '!') {
                break;
            } else {
                throw new Error(`Caractere inválido na codificação RLE: '${ch}'`);
            }
        } while (ch !== '!' && contador++ < cadeia.length);
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