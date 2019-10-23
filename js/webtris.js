const MINO_SIZE = 20;
const LINES = 20;
const COLLUMNS = 10;


class Coord {
    constructor(x, y) {
        this.x = x; this.y = y
    }
    
    add(other) {
        return new Coord(this.x+other.y, this.y+other.y)
    }
    
    rotate(spin) {
        return new Coord(spin*this.y, -spin*this.x)
    }
}


class Mino {
    constructor(context, color) {
    this.context = context;
        this.coord = new Coord(4, 0);
        this.color = color;
    }
    
    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.coord.x*MINO_SIZE, this.coord.y*MINO_SIZE, MINO_SIZE, MINO_SIZE);
    }
}


class Matrix {
    constructor(context) {
        this.context = context;
    }
    
    draw() {
        // clear
        this.context.clearRect(0, 0, COLLUMNS*Mino.size, LINES*MINO_SIZE);
        // grid
        this.context.strokeStyle = "rgba(128, 128, 128, 128)";
        this.context.beginPath();
        for (var x = 0; x <= COLLUMNS*MINO_SIZE; x += MINO_SIZE) {
            this.context.moveTo(x, 0); this.context.lineTo(x, matrixCanvas.height);
        }
        for (var y = 0; y <= LINES*MINO_SIZE; y += MINO_SIZE) {
            this.context.moveTo(0, y); this.context.lineTo(matrixCanvas.width, y);
        }
        this.context.stroke();
    }

}


function draw() {
    matrix.draw()
    mino.draw()
}

window.onload = function() {
    matrixCanvas = document.getElementById("matrix");
    matrixContext = matrixCanvas.getContext("2d");

    mino = new Mino(matrixContext, "orange")
    matrix = new Matrix(matrixContext)
    
    window.requestAnimationFrame(draw)
}