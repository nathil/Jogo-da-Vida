import Automato from '../../automato.js';
import QuadTree from './quadtree.js';

class HashLife {
    constructor(tamanho) {
        this.quadTree = new QuadTree(tamanho);

        this.automato = new Automato([[1,4], [1,2], [2,3], [3,6], [4,5], [5,7], [6,8], [7,6], [8,8]], 0, [6, 7]);
    }

    codificaNo(no0, no1, no2, no3, no4, no5, no6, no7, no8) {
        let celulas = "";

        celulas += no0.hashKey;
        celulas += no1.hashKey;
        celulas += no2.hashKey;
        celulas += no3.hashKey;
        celulas += no4.hashKey;
        celulas += no5.hashKey;
        celulas += no6.hashKey;
        celulas += no7.hashKey;
        celulas += no8.hashKey;

        return celulas;
    }

    avanca3x3(no0, no1, no2, no3, no4, no5, no6, no7, no8) {
        const cadeia = this.codificaNo(no0, no1, no2, no3, no4, no5, no6, no7, no8);
        return this.automato.validarCadeia(cadeia) ? this.quadTree.um : this.quadTree.zero;
    }

    avanca4x4(no) {
        if (no.nivel !== 2) throw new Error("Nível inválido");

        const te = this.avanca3x3(no.te.bd, no.te.te, no.te.td, no.td.te, no.te.be, no.td.be, no.be.te, no.be.td, no.bd.te);
        const td = this.avanca3x3(no.td.be, no.te.td, no.td.te, no.td.td, no.te.bd, no.td.bd, no.be.td, no.bd.te, no.bd.td);
        const be = this.avanca3x3(no.be.td, no.te.be, no.te.bd, no.td.be, no.be.te, no.bd.te, no.be.be, no.be.bd, no.bd.be);
        const bd = this.avanca3x3(no.bd.te, no.te.bd, no.td.be, no.td.bd, no.be.td, no.bd.td, no.be.bd, no.bd.be, no.bd.bd);

        return this.quadTree.criarNo(te, td, be, bd, no.nivel - 1);
    }

    proximaGeracao(no) {
        if (no.nivel < 2) throw new Error("Nível inválido");

        if (no.nivel == 2) {
            return this.avanca4x4(no);
        } 

        const c1 = this.proximaGeracao(this.quadTree.criarNo(no.te.te, no.te.td, no.td.be, no.te.bd, no.nivel - 1));
        const c2 = this.proximaGeracao(this.quadTree.criarNo(no.te.td, no.td.te, no.te.bd, no.td.be, no.nivel - 1));
        const c3 = this.proximaGeracao(this.quadTree.criarNo(no.td.te, no.td.td, no.td.be, no.td.bd, no.nivel - 1));
        const c4 = this.proximaGeracao(this.quadTree.criarNo(no.te.be, no.te.bd, no.be.te, no.be.td, no.nivel - 1));
        const c5 = this.proximaGeracao(this.quadTree.criarNo(no.te.bd, no.td.be, no.be.td, no.bd.te, no.nivel - 1));
        const c6 = this.proximaGeracao(this.quadTree.criarNo(no.td.be, no.td.bd, no.bd.te, no.bd.td, no.nivel - 1));
        const c7 = this.proximaGeracao(this.quadTree.criarNo(no.be.te, no.be.td, no.be.be, no.be.bd, no.nivel - 1));
        const c8 = this.proximaGeracao(this.quadTree.criarNo(no.be.td, no.bd.te, no.be.bd, no.bd.be, no.nivel - 1));
        const c9 = this.proximaGeracao(this.quadTree.criarNo(no.bd.te, no.bd.td, no.bd.be, no.bd.bd, no.nivel - 1));

        return this.quadTree.criarNo(
            this.quadTree.criarNo(c1.bd, c2.be, c4.td, c5.te, no.nivel - 2),
            this.quadTree.criarNo(c2.bd, c3.be, c5.td, c6.te, no.nivel - 2),
            this.quadTree.criarNo(c4.bd, c5.be, c7.td, c8.te, no.nivel - 2),
            this.quadTree.criarNo(c5.bd, c6.be, c8.td, c9.te, no.nivel - 2),
            no.nivel - 1
        );
    }   
}


const hashlife = new HashLife(8);
// console.log(hashlife.quadTree.obterNo(-2, -3, 1));
hashlife.quadTree.inserirNo(-3, -3, hashlife.quadTree.um);
hashlife.quadTree.inserirNo(-3, -2, hashlife.quadTree.um);
hashlife.quadTree.inserirNo(-2, -3, hashlife.quadTree.um);
hashlife.quadTree.inserirNo(-2, -2, hashlife.quadTree.um);

// hashlife.quadTree.imprimeArvore();
// console.log();
// hashlife.quadTree.atualizar(hashlife.proximaGeracao(hashlife.quadTree.raiz));

hashlife.quadTree.imprimeArvore();
console.log(JSON.stringify(hashlife.quadTree.obterNo(-4, -4, 2)));
// console.log(JSON.stringify(hashlife.avanca4x4(hashlife.quadTree.raiz.te)));