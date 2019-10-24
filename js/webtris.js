Array.prototype.add = function(movement) {
    return this.map((x, i) => x + movement[i])
}

Array.prototype.rotate = function(spin) {
    return [spin*pos[1], pos[0]]
}


const MINO_SIZE = 20
const LINES = 20
const COLLUMNS = 10
const INIT_POSITION = [4, -1]
const ACTION_KEY = {
    MOVE_LEFT: "ArrowLeft",
    MOVE_RIGHT: "ArrowRight",
    SOFT_DROP: "ArrowDown",
    ROTATE_CW: "ArrowUp",
    ROTATE_CCW: "z"
}
const MOVEMENT = {
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    DOWN: [0, 1]
}
const SPIN = {
    CW: -1,
    CCW: 1
}


class Tetromino {
    constructor() {
        this.pos = INIT_POSITION
        this.orientation = 0
        this.rotated_last = false
        this.rotation_point_5_used = false
        this.hold_enabled = true
        this.SRS = {
            "-1": [
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, 2], [-1, -2]],
            ],
            1: [
                [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
                [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            ],
        }
    }
        
    get abs_minoes_pos() {
        return this.minoes_pos.map(pos => pos.add(this.pos))
    }

    draw(context) {
        this.abs_minoes_pos.map(pos => draw_mino(context, ...pos, this.color))
    }
}


class T_Tetrimino extends Tetromino {
    constructor() {
        super()
        this.color = "magenta"
        this.minoes_pos = [[-1, 0], [0, 0], [1, 0], [0, 1]]
    }
}

    
function draw_mino(context, x, y, color) {
    context.fillStyle = color
    context.fillRect(x*MINO_SIZE, y*MINO_SIZE, MINO_SIZE, MINO_SIZE);
    context.strokeStyle = "rgba(255, 255, 255, 128)";
    context.strokeRect(x*MINO_SIZE, y*MINO_SIZE, MINO_SIZE, MINO_SIZE);
}

class Matrix {
    constructor() {
        this.cells = Array.from(Array(COLLUMNS), y => Array(LINES))
    }
    
    cell_is_occupied(x, y) {
        return 0 <= x && x < COLLUMNS && y < LINES ? this.cells[x][y] : true
    }
    
    space_to_move(piece_pos, minoes_pos) {
        for (const abs_mino_pos of minoes_pos.map(pos => pos.add(piece_pos))) {
            if (this.cell_is_occupied(...abs_mino_pos))
                return false
        }
        return true
    }
    
    draw(context) {
        // grid
        context.strokeStyle = "rgba(128, 128, 128, 128)";
        context.beginPath();
        for (var x = 0; x <= COLLUMNS*MINO_SIZE; x += MINO_SIZE) {
            context.moveTo(x, 0);
            context.lineTo(x, matrixCanvas.height);
        }
        for (var y = 0; y <= LINES*MINO_SIZE; y += MINO_SIZE) {
            context.moveTo(0, y);
            context.lineTo(matrixCanvas.width, y);
        }
        context.stroke();
    }

}

function move(movement) {
    const test_pos = tetro.pos.add(movement)
    if (matrix.space_to_move(test_pos, tetro.minoes_pos)) {
        tetro.pos = test_pos
    }
}

function rotate(spin) {
    const text_minoes_pos = tetro.minoes_pos.map(pos => [spin*pos[1], pos[0]])
    rotation_point = 0
    for (const movement of tetro.SRS[spin][tetro.orientation]) {
        const test_pos = [tetro.pos[0]+movement[0], tetro.pos[1]+movement[1]]
        if (matrix.space_to_move(test_pos, text_minoes_pos)) {
            tetro.pos = test_pos
            tetro.minoes_pos = text_minoes_pos
            tetro.orientation = (tetro.orientation + spin + 4) % 4
            break;
        }
        rotation_point++
    }
}

function fall() {
    move(MOVEMENT.DOWN);
}

function keyDownHandler(e) {
    switch(e.key){
        case ACTION_KEY.MOVE_LEFT:
            move(MOVEMENT.LEFT);
            break
        case ACTION_KEY.MOVE_RIGHT:
            move(MOVEMENT.RIGHT);
            break
        case ACTION_KEY.SOFT_DROP:
            move(MOVEMENT.DOWN);
            break
        case ACTION_KEY.ROTATE_CW:
            rotate(SPIN.CW);
            break
        case ACTION_KEY.ROTATE_CCW:
            rotate(SPIN.CCW);
            break
    }
}

function keyUpHandler(e) {
}

function draw() {
    matrixContext.clearRect(0, 0, COLLUMNS*MINO_SIZE, LINES*MINO_SIZE);
    matrix.draw(matrixContext)
    tetro.draw(matrixContext)
    requestAnimationFrame(draw)
}

window.onload = function() {

    matrixCanvas = document.getElementById("matrix");
    matrixContext = matrixCanvas.getContext("2d");

    tetro = new T_Tetrimino()
    matrix = new Matrix()

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    setInterval(fall, 1000);
    requestAnimationFrame(draw)
}