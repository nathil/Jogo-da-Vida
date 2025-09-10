/**
 * Classe HashLife para simulação eficiente de autômatos celulares usando o algoritmo HashLife.
 * 
 * Esta implementação utiliza uma estrutura de árvore quad (quadtree) e cache para acelerar a evolução de padrões,
 * permitindo simulações rápidas de autômatos como o Jogo da Vida e variantes personalizadas.
 * 
 * @class
 * 
 * @property {No} raiz - Raiz da árvore quad representando o estado atual do autômato.
 * @property {Automato} automato - Instância do autômato celular, configurada com regras personalizadas.
 * @property {Map<string, No>} static cache - Cache global para armazenar subárvores já processadas.
 * 
 * @param {number} tamanho - Tamanho inicial do tabuleiro (lado).
 * 
 * @method get tamanho Retorna o tamanho atual do tabuleiro.
 * @method inserirCelula(x: number, y: number): void Insere uma célula viva na posição (x, y).
 * @method obterCelula(x: number, y: number): number Retorna o estado da célula na posição (x, y) (1 = viva, 0 = morta).
 * @method limpar(): void Limpa o tabuleiro, tornando todas as células mortas.
 * @method codificaNo(...no: No): string Codifica um conjunto de nós em uma cadeia de caracteres para validação.
 * @method avanca3x3(...no: No): No Calcula a próxima geração para uma região 3x3 de células.
 * @method avanca4x4(no: No): No Calcula a próxima geração para uma região 4x4 de células.
 * @method proximaGeracao(no: No): No Calcula recursivamente a próxima geração para um nó da árvore.
 * @method atualizar(): void Atualiza o estado do autômato para a próxima geração, expandindo se necessário.
 * 
 * @example
 * const hashLife = new HashLife(128);
 * hashLife.inserirCelula(10, 10);
 * hashLife.atualizar();
 */
class HashLife {
    static cache = new Map();

    /**
     * Cria uma instância de HashLife.
     * @param {number} tamanho - Tamanho inicial do tabuleiro.
     */
    constructor(tamanho) {
        this.raiz = No.criarNoVazio(Math.ceil(Math.log2(tamanho)));
        this.automato = new Automato([[1,4], [1,2], [2,3], [3,6], [4,5], [5,7], [6,8], [7,6], [8,8]], 0, [6, 7]);
    }
    
    /**
     * Retorna o tamanho atual do tabuleiro.
     * @returns {number}
     */
    get tamanho() {
        return this.raiz.tamanho;
    }

    get tamanhoReal() {
        return No.cache.size;
    }

    /**
     * Insere uma célula viva na posição (x, y).
     * @param {number} x
     * @param {number} y
     * @param {number} valor - 1 para viva, 0 para morta
     */
    inserirCelula(y, x, valor) {
        this.raiz = No.inserirNo(this.raiz, x, y, valor === 1 ? No.um : No.zero);
    }

    /**
     * Retorna o estado da célula na posição (x, y).
     * @param {number} x
     * @param {number} y
     * @returns {number} 1 se viva, 0 se morta
     */
    obterCelula(x, y) {
        const no = No.obterNo(this.raiz, x, y, 0);
        return no === No.um ? 1 : 0;
    }

    /**
     * Limpa o tabuleiro, tornando todas as células mortas.
     */
    limpar() {
        this.raiz = No.criarNoVazio(this.raiz.nivel);
    }

    /**
     * Codifica um conjunto de nós em uma cadeia de caracteres para validação.
     * @param {...No} no0-no8
     * @returns {string}
     */
    codificaNo(no0, no1, no2, no3, no4, no5, no6, no7, no8) {
        let celulas = "";

        celulas += no0.hash;
        celulas += no1.hash;
        celulas += no2.hash;
        celulas += no3.hash;
        celulas += no4.hash;
        celulas += no5.hash;
        celulas += no6.hash;
        celulas += no7.hash;
        celulas += no8.hash;

        return celulas;
    }

    /**
     * Calcula a próxima geração para uma região 3x3 de células.
     * @param {...No} no0-no8
     * @returns {No}
     */
    avanca3x3(no0, no1, no2, no3, no4, no5, no6, no7, no8) {
        const cadeia = this.codificaNo(no0, no1, no2, no3, no4, no5, no6, no7, no8);            
        return this.automato.validarCadeia(cadeia) ? No.um : No.zero;
    }

    /**
     * Calcula a próxima geração para uma região 4x4 de células.
     * @param {No} no
     * @returns {No}
     */
    avanca4x4(no) {
        const te = this.avanca3x3(no.te.bd, no.te.te, no.te.td, no.td.te, no.te.be, no.td.be, no.be.te, no.be.td, no.bd.te);
        const td = this.avanca3x3(no.td.be, no.te.td, no.td.te, no.td.td, no.te.bd, no.td.bd, no.be.td, no.bd.te, no.bd.td);
        const be = this.avanca3x3(no.be.td, no.te.be, no.te.bd, no.td.be, no.be.te, no.bd.te, no.be.be, no.be.bd, no.bd.be);
        const bd = this.avanca3x3(no.bd.te, no.te.bd, no.td.be, no.td.bd, no.be.td, no.bd.td, no.be.bd, no.bd.be, no.bd.bd);

        return No.criarNo(te, td, be, bd);
    }

    /**
     * Calcula recursivamente a próxima geração para um nó da árvore.
     * Utiliza cache para acelerar o processamento.
     * @param {No} no
     * @returns {No}
     */
    proximaGeracao(no) {
        if (no.vivos === 0) {
            return No.criarNoVazio(no.nivel - 1);
        }

        if (HashLife.cache.has(no.hash)) return HashLife.cache.get(no.hash);

        let resultado;

        if (no.nivel == 2) {
            resultado = this.avanca4x4(no);
        } else {
            const c1 = this.proximaGeracao(No.criarNo(no.te.te, no.te.td, no.te.be, no.te.bd));
            const c2 = this.proximaGeracao(No.criarNo(no.te.td, no.td.te, no.te.bd, no.td.be));
            const c3 = this.proximaGeracao(No.criarNo(no.td.te, no.td.td, no.td.be, no.td.bd));
            const c4 = this.proximaGeracao(No.criarNo(no.te.be, no.te.bd, no.be.te, no.be.td));
            const c5 = this.proximaGeracao(No.criarNo(no.te.bd, no.td.be, no.be.td, no.bd.te));
            const c6 = this.proximaGeracao(No.criarNo(no.td.be, no.td.bd, no.bd.te, no.bd.td));
            const c7 = this.proximaGeracao(No.criarNo(no.be.te, no.be.td, no.be.be, no.be.bd));
            const c8 = this.proximaGeracao(No.criarNo(no.be.td, no.bd.te, no.be.bd, no.bd.be));
            const c9 = this.proximaGeracao(No.criarNo(no.bd.te, no.bd.td, no.bd.be, no.bd.bd));

            resultado = No.criarNo(
                No.criarNo(c1.bd, c2.be, c4.td, c5.te),
                No.criarNo(c2.bd, c3.be, c5.td, c6.te),
                No.criarNo(c4.bd, c5.be, c7.td, c8.te),
                No.criarNo(c5.bd, c6.be, c8.td, c9.te)
            );
        }

        HashLife.cache.set(no.hash, resultado);
        return resultado;
    }

    /**
     * Atualiza o estado do autômato para a próxima geração, expandindo se necessário.
     */
    atualizar() {        
        if (No.existeVivoNaBorda(this.raiz)) {
            this.raiz = No.expandir(this.raiz);
        }

        this.raiz = this.proximaGeracao(No.expandir(this.raiz, this.raiz.nivel + 1));
    }
}