class HashLife {
    static cache = new Map();

    constructor(tamanho) {
        this.raiz = No.criarNoVazio(Math.ceil(Math.log2(tamanho)));
        this.automato = new Automato([[1,4], [1,2], [2,3], [3,6], [4,5], [5,7], [6,8], [7,6], [8,8]], 0, [6, 7]);
    }

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

    avanca3x3(no0, no1, no2, no3, no4, no5, no6, no7, no8) {
        const cadeia = this.codificaNo(no0, no1, no2, no3, no4, no5, no6, no7, no8);            
        return this.automato.validarCadeia(cadeia) ? No.um : No.zero;
    }

    avanca4x4(no) {
        const te = this.avanca3x3(no.te.bd, no.te.te, no.te.td, no.td.te, no.te.be, no.td.be, no.be.te, no.be.td, no.bd.te);
        const td = this.avanca3x3(no.td.be, no.te.td, no.td.te, no.td.td, no.te.bd, no.td.bd, no.be.td, no.bd.te, no.bd.td);
        const be = this.avanca3x3(no.be.td, no.te.be, no.te.bd, no.td.be, no.be.te, no.bd.te, no.be.be, no.be.bd, no.bd.be);
        const bd = this.avanca3x3(no.bd.te, no.te.bd, no.td.be, no.td.bd, no.be.td, no.bd.td, no.be.bd, no.bd.be, no.bd.bd);

        return No.criarNo(te, td, be, bd);
    }

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

    atualizar() {        
        if (No.existeVivoNaBorda(this.raiz)) {
            this.raiz = No.expandir(this.raiz);
        }

        const novaRaiz = this.proximaGeracao(No.expandir(this.raiz, this.raiz.nivel + 1));
        return novaRaiz;
    }
}