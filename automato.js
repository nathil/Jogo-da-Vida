
const automato = [
    [1,4],
    [1,2],
    [2,3],
    [3,6],
    [4,5],
    [5,7],
    [6,8],
    [7,6],
    [8,8]      
]; 

/** 
 * Válida uma cadeia que é representada por uma célula e seus 8 vizinhos.
 * 
 * @param {string} cadeia - Representa o estado atual da célula (y) e seus 8 vizinhos (x) no formato yxxxxxxxx.
 * @returns {boolean} - Representa o novo estado da célula, se está viva ou morta, e também se a cadeia é aceita. 
*/
function validarCadeia(cadeia){    

    let estado = 0;
    let simbolo; 
    let novo_estado = 0; 
    
    for(let i=0; i<9; i++){ 
        simbolo = parseInt(cadeia[i]);
        novo_estado = automato[estado][simbolo];  
        estado = novo_estado;  
    }

    return estado === 6 || estado === 7; 
}