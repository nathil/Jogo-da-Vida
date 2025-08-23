/** 
 * Esta classe representa a tabela do jogo da vida. Seus índices tem origem no centro da tabela.
 * 
 * @param {number} tamanho - O tamanho da tabela. O tamanho real da tabela será o múltiplo de 2 mais próximo.
 */
class Tabela {
    constructor(tamanho) {
        this.tamanho = this.calculaTamanho(tamanho);
        this.meio = this.tamanho / 2;
        this.tabela = this.criaTabela(this.tamanho);

        this.taxaCrescimento = 10;
    }

    /**
     * Calcula o tamanho necessário para a tabela conter a tabela com o tamanho especificado.
     *
     * @param {number} tamanho - O tamanho da tabela.
     * @returns {number} O tamanho necessário para a tabela.
     */
    calculaTamanho(tamanho) {
        return 2 * Math.ceil(tamanho / 2);
    }

    /**
     * Cria a tabela do jogo da vida. Se uma tabela for fornecida, ela será centralizada na nova tabela.
     *
     * @param {number} tamanho - O tamanho da tabela.
     * @param {Array<Array<number>>} [tabela] - A tabela a ser centralizada.
     * @returns {Array<Array<number>>} A tabela criada.
     */
    criaTabela(tamanho, tabela=null) {
        const novaTabela =  Array(tamanho).fill().map(() => Array(tamanho).fill(0));
        
        if (tabela) {
            const tamanhoTabela = tabela.length;
            const diferenca = (novaTabela.length / 2) - (tamanhoTabela / 2);

            for (let i = 0; i < tamanhoTabela; i++) {
                for (let j = 0; j < tamanhoTabela; j++) {
                    novaTabela[i + diferenca][j + diferenca] = tabela[i][j];
                }
            }
        }
        return novaTabela;
    }

    /**
     * Verifica se a posição (x, y) está dentro da tabela.
     *
     * @param {number} x - A coordenada x.
     * @param {number} y - A coordenada y.
     * @param {number} [tamanho=null] - O tamanho da tabela.
     * @returns {boolean} Verdadeiro se a posição estiver na tabela, falso caso contrário.
     */
    estaNaTabela(x, y, tamanho=null) {
        if (tamanho === null) tamanho = this.tamanho;
        return x >= -tamanho / 2 && x < tamanho / 2 && y >= -tamanho / 2 && y < tamanho / 2;
    }

    /**
     * Retorna o valor da célula na posição (x, y). Caso a célula não exista, uma nova célula será criada.
     *
     * @param {number} x - A coordenada x da célula.
     * @param {number} y - A coordenada y da célula.
     * @returns {number} O valor da célula.
     */
    getCelula(x, y) {
        if (!this.estaNaTabela(x, y)) return 0;
        return this.tabela[y + this.meio][x + this.meio];
    }

    aumentarTabela() {
        this.tamanho = this.calculaTamanho(this.tamanho + this.taxaCrescimento);
        this.meio = this.tamanho / 2;
        this.tabela = this.criaTabela(this.tamanho, this.tabela);
    }
}


class Jogo {
    constructor(tamanho) {
        this.tabela = new Tabela(tamanho);
        this.bordaIncerteza = 1;

        this.automato = new Automato(
            [
                [1,4],
                [1,2],
                [2,3],
                [3,6],
                [4,5],
                [5,7],
                [6,8],
                [7,6],
                [8,8]
            ],
            0,
            [6, 7]
        );
    }

    codificarCelula(x, y) {
        let celulas = "";

        celulas += this.tabela.getCelula(x, y);
        celulas += this.tabela.getCelula(x - 1, y - 1);
        celulas += this.tabela.getCelula(x, y - 1);
        celulas += this.tabela.getCelula(x + 1, y - 1);
        celulas += this.tabela.getCelula(x + 1, y);
        celulas += this.tabela.getCelula(x + 1, y + 1);
        celulas += this.tabela.getCelula(x, y + 1);
        celulas += this.tabela.getCelula(x - 1, y + 1);
        celulas += this.tabela.getCelula(x - 1, y);

        return celulas;
    }

    atualizar() {
        const tamanho = this.tabela.tamanho - this.bordaIncerteza * 2;
        const copiaTabela = this.tabela.criaTabela(this.tabela.tamanho);

        for (let i = this.bordaIncerteza; i < tamanho; i++) {
            for (let j = this.bordaIncerteza; j < tamanho; j++) {
                if (!this.estaNaTabela(i, j, tamanho)) continue;

                const celulas = this.codificarCelula(i, j);
                if (this.validarCadeia(celulas)) {
                    copiaTabela[i][j] = 1;

                    if (!this.tabela.estaNaTabela(i, j, tamanho - 2)) this.tabela.aumentarTabela();
                }
            }
        }

        this.tabela = copiaTabela;
    }
}