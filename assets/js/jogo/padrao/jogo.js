/**
 * Classe que controla a lógica do jogo da vida.
 * 
 * @param {number} tamanho - O tamanho inicial da tabela do jogo. O tamanho real será o multiplo de 2 mais próximo.
 * @param {number} bordaDeAtualizacao - A borda de atualização para a detecção de células vivas.
 * @param {number} taxaCrescimento - A taxa de crescimento da tabela. (opcional)
 */
class Padrao {
    constructor(tamanho, bordaDeAtualizacao=2, taxaCrescimento=10) {
        this.tabela = new Tabela(tamanho, taxaCrescimento);
        this.tabelaCopia = new Tabela(tamanho, taxaCrescimento);
        this.bordaDeAtualizacao = bordaDeAtualizacao;
        this.fios = navigator.hardwareConcurrency || 4; // Número de threads para processamento paralelo

        this.automato = new Automato([[1,4], [1,2], [2,3], [3,6], [4,5], [5,7], [6,8], [7,6], [8,8]], 0, [6, 7]);
    }

    get tamanho() {
        return this.tabela.tamanho;
    }

    inserirCelula(x, y, valor) {
        this.tabela.inserirCelula(x, y, valor);
    }
    
    obterCelula(x, y) {
        return this.tabela.obterCelula(x, y);
    }

    limpar() {
        this.tabela = new Tabela(this.tabela.tamanho, this.tabela.taxaCrescimento);
    }
    
    /**
     * Codifica a célula atual (x) e seus vizinhos (y) para o formato xyyyyyyyy
     * 
     * @param {number} x - A coordenada x da célula.
     * @param {number} y - A coordenada y da célula.
     * @returns {string} A representação codificada da célula e seus vizinhos.
     */
    codificaCelula(x, y) {
        let celulas = "";

        celulas += this.tabela.obterCelula(x, y);
        celulas += this.tabela.obterCelula(x - 1, y - 1);
        celulas += this.tabela.obterCelula(x, y - 1);
        celulas += this.tabela.obterCelula(x + 1, y - 1);
        celulas += this.tabela.obterCelula(x + 1, y);
        celulas += this.tabela.obterCelula(x + 1, y + 1);
        celulas += this.tabela.obterCelula(x, y + 1);
        celulas += this.tabela.obterCelula(x - 1, y + 1);
        celulas += this.tabela.obterCelula(x - 1, y);

        return celulas;
    }

    async atualizaSecao(inicioX, fimX, inicioY, fimY, tamanhoBorda) {
        let aumentaTabela = false;

        for (let i = inicioX; i < fimX; i++) {
            for (let j = inicioY; j < fimY; j++) {
                const cadeia = this.codificaCelula(i, j);
                const valida = this.automato.validarCadeia(cadeia);
                const estadoCopia = this.tabelaCopia.obterCelula(i, j);
                if (valida && estadoCopia === 0) {
                    this.tabelaCopia.inserirCelula(i, j, 1);

                    if (!this.tabela.estaNaTabela(i, j, tamanhoBorda)) aumentaTabela = true;
                } else if (!valida && estadoCopia === 1) {
                    this.tabelaCopia.inserirCelula(i, j, 0);
                }
            }
        }

        return aumentaTabela;
    }

    /**
     * Atualiza o estado do jogo.
     */
    async atualizar() {
        const tamanhoBorda = this.tabela.tamanho - this.bordaDeAtualizacao;

        const inicio = -this.tabela.meio;
        const fim = this.tabela.meio;
        const secao = Math.floor(this.tabela.tamanho / this.fios);

        const promessas = await Promise.all(Array(this.fios).fill().map((_, index) => {
            const secaoInicio = inicio + index * secao;
            const secaoFim = index === this.fios - 1 ? fim : secaoInicio + secao;
            return this.atualizaSecao(secaoInicio, secaoFim, inicio, fim, tamanhoBorda);
        }));

        if (promessas.includes(true)) {
            this.tabela.aumentaTabela();
            this.tabelaCopia.aumentaTabela();
        }

        const tabelaAux = this.tabela;
        this.tabela = this.tabelaCopia;
        this.tabelaCopia = tabelaAux;
    }
}