/**
 * Classe que controla a lógica do jogo da vida.
 * 
 * @param {number} tamanho - O tamanho inicial da tabela do jogo. O tamanho real será o multiplo de 2 mais próximo.
 * @param {number} bordaDeAtualizacao - A borda de atualização para a detecção de células vivas.
 * @param {number} taxaCrescimento - A taxa de crescimento da tabela. (opcional)
 */
class Jogo {
    constructor(tamanho, bordaDeAtualizacao=1, taxaCrescimento=10) {
        this.tabela = new Tabela(tamanho, taxaCrescimento);
        this.tabelaCopia = new Tabela(tamanho, taxaCrescimento);
        this.bordaDeAtualizacao = bordaDeAtualizacao;

        this.automato = new Automato([[1,4], [1,2], [2,3], [3,6], [4,5], [5,7], [6,8], [7,6], [8,8]], 0, [6, 7]);
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

    /**
     * Atualiza o estado do jogo.
     */
    atualiza() {
        const tamanhoAtualizacao = this.tabela.tamanho - this.bordaDeAtualizacao * 2;

        const inicio = -this.tabela.tamanho / 2;
        const fim = this.tabela.tamanho / 2;

        let aumenta = false;
        for (let i = inicio; i < fim; i++) {
            for (let j = inicio; j < fim; j++) {
                const cadeia = this.codificaCelula(i, j);
                if (this.automato.validarCadeia(cadeia)) {
                    this.tabelaCopia.inserirCelula(i, j, 1);

                    if (!this.tabela.estaNaTabela(i, j, tamanhoAtualizacao)) aumenta = true;
                } else {
                    this.tabelaCopia.inserirCelula(i, j, 0);
                }
            }
        }

        if (aumenta) {
            this.tabela.aumentaTabela();
            this.tabelaCopia.aumentaTabela();
        }

        const tabelaAux = this.tabela;
        this.tabela = this.tabelaCopia;
        this.tabelaCopia = tabelaAux;
    }
}