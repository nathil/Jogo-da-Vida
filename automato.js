
function retorna_valor(cadeia){
    var automato = [
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
    
    var estado, novo_estado; 
    
    for(var i=0; i<9; i++){
        simbolo = cadeia[i]; 
        novo_estado = automato[estado][simbolo];  

        if(estado == 6 || estado == 7){
            return true; 
        }
        return false; 
    }
}