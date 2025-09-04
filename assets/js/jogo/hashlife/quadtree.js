import { hash } from './utils/string.js';

export default class QuadTree {
    constructor(tamanho) {
        this.cache = new Map();
        
        this.zero = this.criarNo(null, null, null, null, 0, "0", 0);
        this.um = this.criarNo(null, null, null, null, 0, "1", 1);
        
        this.nivel = Math.ceil(Math.log2(tamanho));    
        this.tamanho = Math.pow(2, this.nivel);
        this.meio = this.tamanho / 2;
        this.raiz = this.criarNoVazio(this.nivel);
    }

    criarNo(te, td, be, bd, nivel, hashKey=null, quantidade=0) {
        if (!hashKey) {
            hashKey = hash(`${te?.hashKey},${td?.hashKey},${be?.hashKey},${bd?.hashKey},${nivel}`);
        }
        
        if (this.cache.has(hashKey)) return this.cache.get(hashKey);

        if (!quantidade) {
            quantidade = (te?.quantidade ?? 0) + (td?.quantidade ?? 0) + (be?.quantidade ?? 0) + (bd?.quantidade ?? 0);
        }


        const novoNo = {te, td, be, bd, nivel, hashKey, quantidade};
        this.cache.set(hashKey, novoNo);
        
        return novoNo;
    }

    criarNoVazio(nivel) {
        let noVazio = this.zero;
        
        for (let i = 0; i < nivel; i++) {
            noVazio = this.criarNo(noVazio, noVazio, noVazio, noVazio, i + 1);
        }

        return noVazio;
    }

    expandir() {
        const vazio = this.criarNoVazio(this.nivel - 1);

        const te = this.criarNo(vazio, vazio, vazio, this.raiz.te, this.raiz.nivel);
        const td = this.criarNo(vazio, vazio, this.raiz.td, vazio, this.raiz.nivel);
        const be = this.criarNo(vazio, this.raiz.be, vazio, vazio, this.raiz.nivel);
        const bd = this.criarNo(this.raiz.bd, vazio, vazio, vazio, this.raiz.nivel);

        this.raiz = this.criarNo(te, td, be, bd, this.nivel + 1);
        this.nivel += 1;
        this.tamanho = Math.pow(2, this.nivel);
        this.meio = this.tamanho / 2;
    }

    atualizar(no) {
        while (this.raiz.nivel <= no.nivel) this.expandir();

        // let noAtual;
        // let expandir = false;
        // const nivel = no.nivel - 1;
        // const tamanho = Math.pow(2, nivel);
        // for (let i = -8; i < 8; i += 1) {
        //     if (i == -8 || i == 7) {
        //         for (let j = -8; j < 8; j++) {
        //             noAtual = this.obterNo(i * tamanho, j * tamanho, nivel);
        //             console.log(`No atual em (${i * tamanho}, ${j * tamanho}) - nível ${nivel}:`, noAtual);
        //             if (noAtual.quantidade > 0) {
        //                 expandir = true;
        //                 break;
        //             }
        //         }
        //     } else {
        //         if (this.obterNo(i * tamanho, -8 * tamanho, nivel).quantidade > 0 || this.obterNo(i * tamanho, 7 * tamanho,).quantidade > 0) {
        //             expandir = true;
        //             break;
        //         }
        //     }

        //     if (expandir) {
        //         this.expandir();
        //         break;
        //     }
        // }

        this.inserirNo(-1, -1, no.te, no.nivel);
        this.inserirNo(0, -1, no.td, no.nivel);
        this.inserirNo(-1, 0, no.be, no.nivel);
        this.inserirNo(0, 0, no.bd, no.nivel);
    }

    estaNaArvore(x, y, nivel=null) {
        let meio = this.meio;

        if (nivel) {
            meio = Math.pow(2, nivel) / 2;
        }

        return x >= -meio && x < meio && y >= -meio && y < meio;
    }

    inserirNo(x, y, no, nivel=1) {
        while (!this.estaNaArvore(x, y, this.nivel - 1)) this.expandir();
        
        const x2 = x + this.meio;
        const y2 = y + this.meio;

        while (nivel <= this.nivel) {
            const tamanho = Math.pow(2, nivel);
            const meio = tamanho / 2;

            const noAtual = this.obterNo(x, y, nivel);

            const posX = x2 % tamanho < meio;
            const posY = y2 % tamanho < meio;

            no = this.criarNo(
                posX && posY ? no : noAtual.te,
                !posX && posY ? no : noAtual.td,
                posX && !posY ? no : noAtual.be,
                !posX && !posY ? no : noAtual.bd,
                nivel
            );

            nivel++;
        }

        this.raiz = no;
    }

    obterNo(x, y, nivel=0) {
        if (!this.estaNaArvore(x, y)) {
            return this.criarNoVazio(nivel);
        }

        x += this.meio;
        y += this.meio;

        let noAtual = this.raiz;
        let nivelAtual = this.nivel;

        while (nivelAtual > nivel) {
            const tamanho = Math.pow(2, nivelAtual);
            const meio = tamanho / 2;

            const posX = x % tamanho < meio;
            const posY = y % tamanho < meio;

            if (posX && posY) {
                noAtual = noAtual.te;
            } else if (!posX && posY) {
                noAtual = noAtual.td;
            } else if (posX && !posY) {
                noAtual = noAtual.be;
            } else {
                noAtual = noAtual.bd;
            }

            nivelAtual -= 1;
        }

        return noAtual;
    }

    imprimeArvore() {
        for (let i = -this.meio; i < this.meio; i++) {
            let linha = "";
            for (let j = -this.meio; j < this.meio; j++) {
                linha += this.obterNo(i, j) == this.zero ? "0" : "1";
            }
            console.log(linha);
        }
    }
}

// const tree = new QuadTree(6);
// tree.inserirFolha(0, 0, tree.um);
// // console.log(JSON.stringify(tree.raiz));
// console.log(tree.obterNo(0, 0));
// tree.imprimeArvore();

// console.log("Expandindo a árvore...");

// tree.expandir();
// tree.imprimeArvore();
