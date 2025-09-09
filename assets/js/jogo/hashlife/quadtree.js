class No {
    /**
     * @brief Armazena um cache dos nós criados, para serem utilizados ao invés de criar novos.
     */
    static cache = new Map();

    static zero = No.criarNo(null, null, null, 0, 0, 0, '0'); // Nó folha 0
    static um = No.criarNo(null, null, null, 1, 0, 1, '1'); // Nó folha 1 

    /**
     * Cria um novo nó quadtree.
     * @param {No|null} te 
     * @param {No|null} td 
     * @param {No|null} be 
     * @param {No|null} bd 
     * @param {number} nivel 
     * @param {number} vivos 
     * @param {string} hash 
     */
    constructor(te, td, be, bd, nivel, vivos, hash) {
        this.te = te;
        this.td = td;
        this.be = be
        this.bd = bd;
        this.nivel = nivel;
        this.vivos = vivos;
        this.hash = hash;

        this.tamanho = Math.pow(2, this.nivel);
        this.meio = Math.floor(this.tamanho / 2);
    }

    /**
     * Calcula o hash de um nó quadtree.
     * @param {No|null} td 
     * @param {No|null} te 
     * @param {No|null} bd 
     * @param {No|null} be 
     * @param {number} nivel 
     * @param {number} vivos 
     * @returns O hash do nó com os parâmetros passados.
     */
    static calculaHash(td, te, bd, be, nivel=null, vivos=null) {
        return hash(`${te?.hash},${td?.hash},${be?.hash},${bd?.hash},${nivel},${vivos}`);
    }
    
    /**
     * Cria um novo nó quadtree. Caso o nó esteja armazenado em cache, ele será retornado ao invés de criar um novo. 
     * @param {No|null} te 
     * @param {No|null} td 
     * @param {No|null} be 
     * @param {No|null} bd 
     * @param {number} nivel 
     * @param {number} vivos 
     * @param {string} hash 
     * @returns Retorna o novo nó criado.
     */
    static criarNo(te, td, be, bd, nivel=null, vivos=null, hash=null) {
        vivos ??= (te?.vivos ?? 0) + (td?.vivos ?? 0) + (be?.vivos ?? 0) + (bd?.vivos ?? 0);
        nivel ??= bd?.nivel !== null ? bd.nivel + 1 : 0;
        hash ??= No.calculaHash(td, te, bd, be, nivel, vivos);
        
        if (No.cache.has(hash)) return No.cache.get(hash);

        const no = new No(te, td, be, bd, nivel, vivos, hash);
        No.cache.set(hash, no);
        return no;
    }

    /**
     * Cria um nó de nivel n completo com zeros
     * @param {number} nivel 
     * @returns Um nó com o tamanho especificado
     */estaNaBorda
    static criarNoVazio(nivel=0) {
        let no = No.zero;
        
        while (no.nivel < nivel) {
            no = No.criarNo(no, no, no, no, no.nivel + 1);
        }

        return no;
    }

    /**
     * Verifica se um ponto (x, y) está dentro da árvore quadtree.
     * @param {No} no 
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean} Verdadeiro se o ponto está na árvore, falso caso contrário.
     */
    static estaNaArvore(no, x, y) {
        return x >= -no.meio && x < no.meio && y >= -no.meio && y < no.meio;
    }

    /**
     * Verifica se há algum célula viva na borda do nó.
     * @param {No} no 
     * @returns {boolean} Verdadeiro se há alguma célula viva na borda, falso caso contrário.
     */
    static existeVivoNaBorda(no) {
        if (no.nivel < 2) return no.vivos > 0;

        for (let i = -no.meio; i < no.meio; i++) {
            if (i === -no.meio || i === no.meio - 1) {
                for (let j = -no.meio; j < no.meio; j++) {
                    if (No.obterNo(no, i, j).vivos > 0) return true;
                }
            } else {
                if (No.obterNo(no, i, -no.meio).vivos > 0) return true;
                if (No.obterNo(no, i, no.meio - 1).vivos > 0) return true;
            }

        }

        return false;
    }

    /**
     * Retorna o nó quadtree correspondente a um ponto (x, y) em um determinado nível.
     * @param {No} no 
     * @param {number} x 
     * @param {number} y 
     * @param {number} nivel 
     * @returns {No} O nó quadtree correspondente ao ponto (x, y) no nível especificado.
     */
    static obterNo(no, x, y, nivel=0) {
        if (!No.estaNaArvore(no, x, y)) return No.criarNoVazio(nivel);

        x += no.meio;
        y += no.meio;

        while (no.nivel > nivel) {
            const posX = x % no.tamanho < no.meio;
            const posY = y % no.tamanho < no.meio;

            no = posX
                ? (posY ? no.te : no.be)
                : (posY ? no.td : no.bd);
        }

        return no;
    }

    /**
     * Obtém o nó central de um nó quadtree.
     * @param {No} no 
     * @returns {No} O nó central.
     */
    static obterCentro(no) {
        return No.criarNo(no.te.bd, no.td.be, no.be.td, no.bd.te);
    }

    /**
     * Insere um novo nó em uma posição (x, y) na árvore quadtree.
     * @param {No} no 
     * @param {number} y 
     * @param {number} x 
     * @param {No} novoNo 
     * @returns {No} O nó atualizado.
     */
    static inserirNo(no, y, x, novoNo) {
        if (!No.estaNaArvore(No.obterCentro(no), x, y)) {
            const nivel = Math.ceil(Math.log2(Math.max(Math.abs(x), Math.abs(y)) * 2));
            no = No.expandir(no, nivel);
        }
        
        const realX = x + no.meio;
        const realY = y + no.meio;

        while (novoNo.nivel < no.nivel) {
            const tamanho = Math.pow(2, novoNo.nivel + 1);
            const meio = tamanho / 2;

            const noAtual = No.obterNo(no, x, y, novoNo.nivel + 1);

            const posX = realX % tamanho < meio;
            const posY = realY % tamanho < meio;

            novoNo = No.criarNo(
                posX && posY ? novoNo : noAtual.te,
                !posX && posY ? novoNo : noAtual.td,
                posX && !posY ? novoNo : noAtual.be,
                !posX && !posY ? novoNo : noAtual.bd
            );
        }

        return novoNo;
    }

    /**
     * Expande um nó quadtree para um nível maior.
     * @param {No} no 
     * @param {number} nivel 
     * @returns {No} O nó expandido.
     */
    static expandir(no, nivel=null) {
        nivel ??= no.nivel + 1;
        
        while (no.nivel < nivel) {
            const vazio = No.criarNoVazio(no.nivel - 1);
            
            const te = No.criarNo(vazio, vazio, vazio, no.te);
            const td = No.criarNo(vazio, vazio, no.td, vazio);
            const be = No.criarNo(vazio, no.be, vazio, vazio);
            const bd = No.criarNo(no.bd, vazio, vazio, vazio);

            no = No.criarNo(te, td, be, bd);
        }

        return no;
    }

    /**
     * Itera uma função sobre um nó
     * @param {No} no 
     * @param {Function} funcao 
     * @param {number} inicioX 
     * @param {number} inicioY 
     * @param {number} fimX 
     * @param {number} fimY 
     * @returns 
     */
    static iterarFolhas(no, funcao, inicioX=null, inicioY=null, fimX=null, fimY=null) {
        inicioX ??= -no.meio;
        inicioY ??= -no.meio;
        fimX ??= no.meio;
        fimY ??= no.meio;

        if (no.nivel === 0) {
            return funcao(no, inicioX, inicioY);
        }

        const centroX = (inicioX + fimX) / 2;
        const centroY = (inicioY + fimY) / 2;

        No.iterarFolhas(no.te, funcao, inicioX, inicioY, centroX, centroY);
        No.iterarFolhas(no.td, funcao, centroX, inicioY, fimX, centroY);
        No.iterarFolhas(no.be, funcao, inicioX, centroY, centroX, fimY);
        No.iterarFolhas(no.bd, funcao, centroX, centroY, fimX, fimY);
        return;
    }

    /**
     * Converte um nó quadtree em uma matriz.
     * @param {No} no 
     * @returns {Array<Array<number>>} A matriz representando o nó.
     */
    static noParaMatriz(no) {
        const matriz = Array(no.tamanho).fill().map(() => Array(no.tamanho));

        No.iterarFolhas(no, (folha, x, y) => {
            matriz[x + no.meio][y + no.meio] = folha.bd;
        });

        return matriz;
    }

    /**
     * Imprime um nó quadtree.
     * @param {No} no 
     */
    static imprimeNo(no) {
        const matriz = No.noParaMatriz(no);
        let str = '';

        for (let i = 0; i < matriz.length; i++) {
            for (let j = 0; j < matriz.length; j++) {
                str += matriz[i][j] ?? '*'; 
            }
            str += '\n';
        }

        console.log(str);
    }
}