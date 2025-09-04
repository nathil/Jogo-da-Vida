export default class Automato {
    constructor(transicoes, estadoInicial, estadosFinais) {
        this.transicoes = transicoes
        this.estadoInicial = estadoInicial
        this.estadosFinais = estadosFinais
    }

    validarCadeia(cadeia) { 
        let simbolo; 
        let estado = this.estadoInicial;
        let novo_estado = 0;

        for(let i=0; i<cadeia.length; i++){ 
            simbolo = parseInt(cadeia[i]);
            novo_estado = this.transicoes[estado][simbolo];  
            estado = novo_estado;  
        }

        return this.estadosFinais.includes(estado);
    }
}