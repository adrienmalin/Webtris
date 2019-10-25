Array.prototype.add = function(other) {
    return this.map((x, i) => x + other[i])
}
Array.prototype.rotate = function(spin) {
    return [-spin*this[1], spin*this[0]]
}
Array.prototype.sample = function() {
    return this.splice(Math.floor(Math.random()*this.length), 1)[0]
}


const MINO_SIZE = 20
const NEXT_PIECES = 5
const MATRIX_LINES = 20
const MATRIX_COLUMNS = 10
const HELD_PIECE_POSITION = [2, 2]
const FALLING_PIECE_POSITION = [4, 0]
const NEXT_PIECES_POSITIONS = Array.from({length: NEXT_PIECES}, (v, k) => [2, k*4+2])
const LOCK_DELAY = 500
const FALL_DELAY = 1000
const AUTOREPEAT_DELAY = 300
const AUTOREPEAT_PERIOD = 10
const MOVEMENT = {
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    DOWN: [0, 1]
}
const SPIN = {
    CW: 1,
    CCW: -1
}
const T_SPIN = {
    NULL: "",
    MINI: "MINI\nT-SPIN",
    T_SPIN: "T-SPIN"
}
const T_SLOT = {
    A: 0,
    B: 1,
    C: 3,
    D: 2
}
const SCORES = [
    {LINES_CLEAR_NAME: "", NO_T_SPIN: 0, MINI_T_SPIN: 1, T_SPIN: 4},
    {LINES_CLEAR_NAME: "SINGLE", NO_T_SPIN: 1, MINI_T_SPIN: 2, T_SPIN: 8},
    {LINES_CLEAR_NAME: "DOUBLE", NO_T_SPIN: 3, T_SPIN: 12},
    {LINES_CLEAR_NAME: "TRIPLE", NO_T_SPIN: 5, T_SPIN: 16},
    {LINES_CLEAR_NAME: "TETRIS", NO_T_SPIN: 8},
]


shapes = []
class Tetromino {
    constructor() {
        this.pos = FALLING_PIECE_POSITION
        this.orientation = 0
        this.rotated_last = false
        this.rotation_point_5_used = false
        this.hold_enabled = true
        this.srs = {
            CW: [
                [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]],
                [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]],
                [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]],
                [[0, 0], [-1, 0], [-1,  1], [0,  2], [-1, -2]],
            ],
            CCW: [
                [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]],
                [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]],
                [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]],
                [[0, 0], [-1, 0], [-1,  1], [0,  2], [-1, -2]],
            ],
        }
        if (!shapes.lenght)
            shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']
        this.shape = shapes.sample()
        switch(this.shape) {
            case 'I':
                this.color = "cyan"
                this.minoes_pos = [[-1, 0], [0, 0], [1, 0], [2, 0]]
                this.srs = {
                    CW: [
                        [[ 1,  0], [-1,  0], [ 2,  0], [-1,  1], [ 2, -2]],
                        [[ 0,  1], [-1,  1], [ 2,  1], [-1, -1], [ 2,  2]],
                        [[-1,  0], [ 1,  0], [-2,  0], [ 1, -1], [-2,  2]],
                        [[ 0,  1], [ 1, -1], [-2, -1], [ 1,  1], [-2, -2]],
                    ],
                    CCW: [
                        [[ 0,  1], [-1,  1], [ 2,  1], [-1, -1], [ 2,  2]],
                        [[-1,  0], [ 1,  0], [-2,  0], [ 1, -1], [-2,  2]],
                        [[ 0, -1], [ 1, -1], [-2, -1], [ 1,  1], [-2, -2]],
                        [[ 1,  0], [-1,  0], [ 2,  0], [-1,  1], [ 2, -2]],
                    ],
                }
                break
            case 'J':
                this.color = "blue"
                this.minoes_pos = [[-1, -1], [-1, 0], [0, 0], [1, 0]]
                break
            case 'L':
                this.color = "orange"
                this.minoes_pos = [[-1, 0], [0, 0], [1, 0], [1, -1]]
                break
            case 'O':
                this.color = "yellow"
                this.minoes_pos = [[0, 0], [1, 0], [0, -1], [1, -1]]
                this.srs = {
                    CW: [[]],
                    CCW: [[]]
                }
                break
            case 'S':
                this.color = "green"
                this.minoes_pos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
                break
            case 'T':
                this.color = "magenta"
                this.minoes_pos = [[-1, 0], [0, 0], [1, 0], [0, -1]]
                break
            case 'Z':
                this.color = "red"
                this.minoes_pos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
                break
        }
    }
        
    get abs_minoes_pos() {
        return this.minoes_pos.map(pos => pos.add(this.pos))
    }

    draw(context) {
        this.abs_minoes_pos.map(pos => draw_mino(context, ...pos, this.color))
    }
}


function draw_mino(context, x, y, color) {
    context.fillStyle = color
    context.fillRect(x*MINO_SIZE, y*MINO_SIZE, MINO_SIZE, MINO_SIZE)
    context.lineWidth = 0.5
    context.strokeStyle = "white"
    context.strokeRect(x*MINO_SIZE, y*MINO_SIZE, MINO_SIZE, MINO_SIZE)
}


class Matrix {
    constructor(context) {
        this.context = context
        this.cells = Array.from({length: MATRIX_COLUMNS}, (v, k) => Array(MATRIX_LINES))
    }
    
    cell_is_occupied(x, y) {
        return 0 <= x && x < MATRIX_COLUMNS && y < MATRIX_LINES ? this.cells[x][y] : true
    }
    
    space_to_move(piece_pos, minoes_pos) {
        for (const pos of minoes_pos) {
            if (this.cell_is_occupied(...pos.add(piece_pos)))
                return false
        }
        return true
    }
    
    draw() {
        // grid
        const width = MATRIX_COLUMNS*MINO_SIZE
        const height = MATRIX_LINES*MINO_SIZE
        this.context.clearRect(0, 0, width, height)
        this.context.strokeStyle = "rgba(128, 128, 128, 128)"
        this.context.lineWidth = 0.5
        this.context.beginPath()
        for (var x = 0; x <= width; x += MINO_SIZE) {
            this.context.moveTo(x, 0);
            this.context.lineTo(x, height);
        }
        for (var y = 0; y <= height; y += MINO_SIZE) {
            this.context.moveTo(0, y);
            this.context.lineTo(width, y);
        }
        this.context.stroke()
        // falling piece
        falling_piece.draw(this.context)
    }
}

function move(movement) {
    const test_pos = falling_piece.pos.add(movement)
    if (matrix.space_to_move(test_pos, falling_piece.minoes_pos)) {
        falling_piece.pos = test_pos
        return true
    }
    else {
        return false
    }
}

function rotate(spin) {
    const test_minoes_pos = falling_piece.minoes_pos.map(pos => pos.rotate(spin))
    rotation_point = 0
    for (const movement of falling_piece.srs[spin==SPIN.CW?"CW":"CCW"][falling_piece.orientation]) {
        const test_pos = falling_piece.pos.add(movement)
        if (matrix.space_to_move(test_pos, test_minoes_pos)) {
            falling_piece.pos = test_pos
            falling_piece.minoes_pos = test_minoes_pos
            falling_piece.orientation = (falling_piece.orientation + spin + 4) % 4
            break;
        }
        rotation_point++
    }
}

function fall() {
    move(MOVEMENT.DOWN);
}

function moveLeft() {
    move(MOVEMENT.LEFT);
}

function moveRight() {
    move(MOVEMENT.RIGHT)
}

function softDrop() {
    move(MOVEMENT.DOWN)
}

function hardDrop() {
    while(move(MOVEMENT.DOWN)) {

    }
}

function rotateCW() {
    rotate(SPIN.CW)
}

function rotateCCW() {
    rotate(SPIN.CCW)
}

actions = {
    "ArrowLeft":    moveLeft,
    "ArrowRight":   moveRight,
    "ArrowDown":    softDrop,
    " ":            hardDrop,
    "ArrowUp":      rotateCW,
    "z":            rotateCCW
}

pressedKeys = new Set()
repeatableActions = [moveLeft, moveRight, softDrop]
actionsToRepeat = []
autorepeatTimeoutID = null
autorepeatIntervalID = null

function autorepeat() {
    if (actionsToRepeat.length) {
        actionsToRepeat[0]()
        if (autorepeatTimeoutID) {
            autorepeatTimeoutID = clearTimeout(autorepeatTimeoutID)
            autorepeatIntervalID = setInterval(autorepeat, AUTOREPEAT_PERIOD)
        }
    }
    else {
        if (autorepeatTimeoutID)
            autorepeatTimeoutID = clearTimeout(autorepeatTimeoutID)
        if (autorepeatIntervalID)
            autorepeatIntervalID = clearInterval(autorepeatIntervalID)
    }
}

function keyDownHandler(e) {
    if (e.key in actions) {
        if (!pressedKeys.has(e.key)) {
            pressedKeys.add(e.key)
            action = actions[e.key]
            action()
            if (repeatableActions.includes(action)) {
                actionsToRepeat.unshift(action)
                if (autorepeatTimeoutID) {
                    autorepeatTimeoutID = clearTimeout(autorepeatTimeoutID)
                }
                if (autorepeatIntervalID) {
                    autorepeatIntervalID = clearInterval(autorepeatIntervalID)
                }
                if (actionsToRepeat == softDrop)
                    autorepeatIntervalID = setInterval(autorepeat, FALL_DELAY / 20)
                else
                    autorepeatTimeoutID = setTimeout(autorepeat, AUTOREPEAT_DELAY)
            }
        }
    }
}

function keyUpHandler(e) {
    if (e.key in actions) {
        pressedKeys.delete(e.key)
        action = actions[e.key]
        if (actionsToRepeat.includes(action)) {
            actionsToRepeat.splice(actionsToRepeat.indexOf(action), 1)
            if (!actionsToRepeat.length) {
                if (autorepeatTimeoutID) {
                    autorepeatTimeoutID = clearTimeout(autorepeatTimeoutID)
                }
                if (autorepeatIntervalID) {
                    autorepeatIntervalID = clearInterval(autorepeatIntervalID)
                }
            }
        }
    }
}

function draw() {
    held_piece.draw(holdContext)
    matrix.draw()
    next_pieces.map(piece => piece.draw(nextContext))
    requestAnimationFrame(draw)
}

window.onload = function() {
    holdContext = document.getElementById("hold").getContext("2d")
    matrixContext = document.getElementById("matrix").getContext("2d")
    nextContext = document.getElementById("next").getContext("2d")

    matrix = new Matrix(matrixContext)
    held_piece = new Tetromino()
    held_piece.pos = HELD_PIECE_POSITION
    falling_piece = new Tetromino()
    falling_piece.pos = FALLING_PIECE_POSITION
    next_pieces = Array.from({length: NEXT_PIECES}, (v, k) => new Tetromino())
    next_pieces.map((piece, i, array) => piece.pos = NEXT_PIECES_POSITIONS[i])

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    setInterval(fall, FALL_DELAY);
    requestAnimationFrame(draw)
}