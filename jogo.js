const tableSize = 64;
const tableCenter = tableSize / 2;

let tabela = [];
for (let i = 0; i < tableSize; i++) {
    tabela.push([]);
    for (let j = 0; j < tableSize; j++) {
        tabela[i].push(0);
    }
}

function parse(i, j) {
    let cells = "";
    cells += tabela[i][j];
    cells += tabela[i-1][j-1];
    cells += tabela[i][j-1];
    cells += tabela[i+1][j-1];
    cells += tabela[i+1][j];
    cells += tabela[i+1][j+1];
    cells += tabela[i][j+1];
    cells += tabela[i-1][j+1];
    cells += tabela[i-1][j];

    return cells;
}

function updateTabela(){
    const tabelaCopia = []
    for(let i = 0; i < tableSize; i++){
        tabelaCopia.push([]);
        for(let j = 0; j < tableSize; j++){
            if (i < 1 || i > tableSize - 2 || j < 1 || j > tableSize - 2){
                tabelaCopia[i].push(0);
                continue;
            }
            const cells = parse(i, j); 
            tabelaCopia[i].push(validarCadeia(cells) ? 1 : 0);
        }
    }
    tabela = tabelaCopia;
}

tabela[32][32] = 1;
updateTabela();
console.log(parse(tableCenter, tableCenter));