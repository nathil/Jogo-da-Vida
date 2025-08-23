class TableUI {
  constructor(size) {
    this.offset = createVector(0, 0);
    
    this.dS = 1;
    this.dT = null;
    this.sF = null;
    this.zoom = null;
    this.setZoom(3.33);

    this.size = size;
    this.center = size / 2;
    
    const tr = this.screenToTable(createVector(0, 0), false);
    const bl = this.screenToTable(createVector(this.size, this.size), false);
    const d = bl.x - tr.x;
    
    this.tableSize = pow(2, ceil(log(d)/log(2)));
    this.tableCenter = this.tableSize / 2;

    this.table = [];
    for (let i = 0; i < this.tableSize; i++) {
      this.table.push([]);
      for (let j = 0; j < this.tableSize; j++) {
        this.table[i].push(0);
      }
    }
  }

  setZoom(z) {
    const mousePos = createVector(mouseX, mouseY);
    const ref = this.isInScreen(mousePos) ? mousePos : createVector(this.size/2, this.size/2);
    const refTable = this.screenToTable(ref.copy(), true, false);

    this.zoom = constrain(z, 1, 10);
    this.sF = pow(2, this.zoom);
    this.dT = this.dS / this.sF;

    const refScreen = this.tableToScreen(refTable);
    this.offset.sub(refScreen.sub(ref));
  }

  isInScreen(p) {
    return p.x >= 0 && p.x < this.size && p.y >= 0 && p.y < this.size;
  }

  isInTable(p) {
    return p.x >= 0 && p.x < this.tableSize && p.y >= 0 && p.y < this.tableSize;
  }

  getCell(i, j) {
    if (!this.isInTable(createVector(i, j))) return 0;
    return this.table[i][j];
  }

  tableToScreen(p, offset=true) {
    p.sub(this.tableCenter, this.tableCenter);
    p.mult(this.dS).div(this.dT);

    if (offset) p.add(this.center, this.center).add(this.offset);;

    return p;
  }

  screenToTable(p, offset=true, c=true) {
    p.sub(this.center, this.center).sub(this.offset);
    p.mult(this.dT).div(this.dS);
    
    if (c) p.set(ceil(p.x), ceil(p.y));
    if (offset) p.add(this.tableCenter, this.tableCenter);
    return p;
  }
  
  draw() {
    const tl = this.screenToTable(createVector(-this.sF, -this.sF));
    const br = this.screenToTable(createVector(this.size, this.size));

    fill("white");
    if (this.sF < 12) blendMode(ADD);
    const startX = tl.x, startY = tl.y, endX = br.x, endY = br.y;
    for (let i = startX; i < endX; i++) {
      for (let j = startY; j < endY; j++) {
        if (this.getCell(i, j)) {
          const pos = this.tableToScreen(createVector(i, j));
          square(pos.x, pos.y, this.sF);
        }
      }
    }
  }

  moveTable() {
    if (mouseIsPressed && this.isInScreen(createVector(mouseX, mouseY))) {
      this.offset.add(createVector(movedX, movedY)); 
    }
  }
}

let table;
function setup() {
  table = new TableUI(500);
  const canvas = createCanvas(table.size, table.size);
  canvas.elt.addEventListener('wheel', (e) => e.preventDefault());

  table.table[31][32] = 1;
  table.table[31][33] = 1;
  table.table[32][32] = 1;
  table.table[32][33] = 1;
}

function mouseWheel(e) {
  if ((table.zoom > 1 && e.delta > 0) || (table.zoom < 10 && e.delta < 0)) table.setZoom(table.zoom + (e.delta < 0 ? 0.1 : -0.1));
}

function draw() {
  blendMode(BLEND);
  background(0); 
  table.draw();

  table.moveTable();
  frameRate(60);
}