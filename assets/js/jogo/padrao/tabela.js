/**
 * Esta classe representa a tabela do jogo da vida. Seus índices tem origem no centro da tabela.
 * 
 * @param {number} tamanho - O tamanho inicial da tabela. O tamanho real será o multiplo de 2 mais próximo.
 */
class Tabela {
    constructor(tamanho, taxaCrescimento=10) {
        this.taxaCrescimento = taxaCrescimento;
        this.defineTamanho(tamanho);
    }

    /**
     * Calcula o tamanho necessário para a tabela conter a tabela com o tamanho especificado.
     * 
     * O tamanho necessário será o próximo múltiplo de 2 que seja maior ou igual ao tamanho especificado.
     * 
     * @param {number} tamanho - O tamanho da tabela a ser contida.
     * @returns {number} O tamanho necessário para a tabela.
     */
    calculaTamanho(tamanho) {
        return 2 * Math.ceil(tamanho / 2);
    }

    /**
     * Cria a tabela com o tamanho especificado. Se uma tabela for fornecida, ela será centralizada na nova tabela.
     * 
     * @param {number} tamanho - O tamanho da tabela a ser criada.
     * @param {Array} [tabela] - A tabela a ser centralizada (opcional).
     * @returns {Array} A tabela criada.
     */
    
    criaTabela(tamanho, tabela=null) {
        const novaTabela = Array(tamanho*tamanho).fill(0);

        if (tabela) {
            const tamanhoTabela = Math.sqrt(tabela.length);
            const distancia = (tamanho / 2) - (tamanhoTabela / 2);

            for (let i = 0; i < tamanhoTabela; i++) {
                for (let j = 0; j < tamanhoTabela; j++) {
                    novaTabela[(i + distancia) * tamanho + (j + distancia)] = tabela[i * tamanhoTabela + j];
                }
            }
        }

        return novaTabela;
    }

    /** 
     * Define o novo tamanho da tabela, mantendo a posição relativa do conteúdo
     * 
     * @param {number} novoTamanho - O novo tamanho da tabela.
     */
    defineTamanho(novoTamanho) {
        this.tamanho = this.calculaTamanho(novoTamanho);
        this.meio = this.tamanho / 2;
        this.tabela = this.criaTabela(this.tamanho, this.tabela);
    }

    /**
     * Aumenta o tamanho da tabela em uma taxa fixa, mantendo a posição relativa do conteúdo.
     * 
     * A taxa de crescimento é definida pela propriedade `taxaCrescimento`.
     */
    aumentaTabela(taxaCrescimento=null) {
        if (!taxaCrescimento) taxaCrescimento = this.taxaCrescimento;
        const novoTamanho = this.tamanho + taxaCrescimento;
        this.defineTamanho(novoTamanho);
    }

    /**
     * Converte as coordenadas físicas x e y da tabela em coordenadas relativas ao centro.
     * 
     * @param {number} x - A coordenada x a ser convertida.
     * @param {number} y - A coordenada y a ser convertida.
     * @returns {Object} As coordenadas relativas ao centro.
     */
    fisicasParaRelativas(x, y) {
        return {
            x: x - this.meio,
            y: y - this.meio
        };
    }

    /**
     * Converte as coordenadas x e y relativas ao centro da tabela em coordenadas físicas.
     * 
     * @param {number} x - A coordenada x a ser convertida.
     * @param {number} y - A coordenada y a ser convertida.
     * @returns {Object} As coordenadas físicas.
     */
    relativasParaFisicas(x, y) {
        return {
            x: x + this.meio,
            y: y + this.meio
        };
    }

    /**
     * Retorna se a posição relativa representado pelas coordenadas x e y está dentro da tabela.
     * 
     * @param {number} x - A coordenada x da posição a ser verificada.
     * @param {number} y - A coordenada y da posição a ser verificada.
     * @param {number} tamanho - tamanho da tabela. (opcional)
     * @returns {boolean} Verdadeiro se a posição está dentro da tabela, falso caso contrário.
     */
    estaNaTabela(x, y, tamanho) {
        if (!tamanho) tamanho = this.tamanho;
        return x >= -tamanho / 2 && x < tamanho / 2 && y >= -tamanho / 2 && y < tamanho / 2;
    }

    /**
     * Retorna o valor armazenado pela célula nas coordenadas x e y.
     * 
     * @param {number} x - A coordenada x da célula a ser obtida.
     * @param {number} y - A coordenada y da célula a ser obtida.
     * @returns {number} O valor armazenado na célula, ou 0 se a posição estiver fora da tabela.
     */
    obterCelula(x, y) {
        if (!this.estaNaTabela(x, y)) return 0;

        const pos = this.relativasParaFisicas(x, y);
        return this.tabela[pos.y * this.tamanho + pos.x];
    }

    /** 
     * Insere o valor passado na célula nas coordenadas x e y.
     * 
     * @param {number} x - A coordenada x da célula a ser inserida.
     * @param {number} y - A coordenada y da célula a ser inserida.
     * @param {number} valor - O valor a ser inserido na célula.
     */
    inserirCelula(x, y, valor) {
       if (!this.estaNaTabela(x, y)) this.aumentaTabela((Math.max(Math.abs(x), Math.abs(y)) - this.meio) * 2);

        const indice = (y + this.meio) * this.tamanho + (x + this.meio);
        this.tabela[indice] = valor;
    }

    /**
     * Imprime a tabela no console. Se uma tabela diferente for fornecida, ela será impressa em vez da tabela atual.
     * 
     * @param {Array} tabela - A tabela a ser impressa.
     */
    imprimirTabela(tabela=null) {
        if (!tabela) tabela = this.tabela;
        let tabelaString = "";
        for (let y = -this.meio; y < this.meio; y++) {
            let linha = "";
            for (let x = -this.meio; x < this.meio; x++) {
                linha += this.obterCelula(x, y) + " ";
            }
            tabelaString += linha + "\n";
        }
        console.log(tabelaString);
    }
}