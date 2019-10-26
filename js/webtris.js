Array.prototype.add = function(other) {
    return this.map((x, i) => x + other[i])
}
Array.prototype.translate = function(vector) {
    return this.map(pos => pos.add(vector))
}
Array.prototype.rotate = function(spin) {
    return [-spin*this[1], spin*this[0]]
}
Array.prototype.sample = function() {
    return this.splice(Math.floor(Math.random()*this.length), 1)[0]
}


const MINO_SIZE = 20
const NEXT_PIECES = 5
const HOLD_ROWS = 6
const HOLD_COLUMNS = 6
const MATRIX_ROWS = 20
const MATRIX_COLUMNS = 10
const NEXT_ROWS = 20
const NEXT_COLUMNS = 6
const HELD_PIECE_POSITION = [2, 2]
const FALLING_PIECE_POSITION = [4, 0]
const NEXT_PIECES_POSITIONS = Array.from({length: NEXT_PIECES}, (v, k) => [2, k*4+2])
const LOCK_DELAY = 500
const FALL_DELAY = 1000
const AUTOREPEAT_DELAY = 300
const AUTOREPEAT_PERIOD = 10
const MOVEMENT = {
    LEFT:  [-1, 0],
    RIGHT: [ 1, 0],
    DOWN:  [ 0, 1]
}
const SPIN = {
    CW:   1,
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
const REPEATABLE_ACTIONS = [moveLeft, moveRight, softDrop]


class Scheduler {
    constructor() {
        this.intervalTasks = new Map()
        this.timeoutTasks = new Map()
    }

    setInterval(func, delay) {
        this.intervalTasks.set(func, window.setInterval(func, delay))
    }

    setTimeout(func, delay) {
        this.timeoutTasks.set(func, window.setTimeout(func, delay))
    }

    clearInterval(func) {
        if (this.intervalTasks.has(func)) {
            window.clearInterval(this.intervalTasks.get(func))
            this.intervalTasks.delete(func)
        }
    }

    clearTimeout(func) {
        if (this.timeoutTasks.has(func)) {
            window.clearTimeout(this.timeoutTasks.get(func))
            this.timeoutTasks.delete(func)
        }
    }
}


shapes = []
class Tetromino {
    constructor(position=null, shape=null) {
        this.pos = position
        this.orientation = 0
        this.rotatedLast = false
        this.rotationPoint5Used = false
        this.holdEnabled = true
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
        if (shape)
            this.shape = shape
        else {
            if (!shapes.length)
                shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']
            this.shape = shapes.sample()
        }
        switch(this.shape) {
            case 'I':
                this.color = "rgb(132, 225, 225)"
                this.ghostColor = "rgba(40, 164, 164, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [2, 0]]
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
                this.color = "rgb(102, 163, 255)"
                this.ghostColor = "rgba(0, 82, 204, 0.5)"
                this.minoesPos = [[-1, -1], [-1, 0], [0, 0], [1, 0]]
                break
            case 'L':
                this.color = "rgb(255, 148, 77)"
                this.ghostColor = "rgba(204, 82, 0, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [1, -1]]
                break
            case 'O':
                this.color = "rgb(255, 255, 102)"
                this.ghostColor = "rgba(204, 204, 0, 0.5)"
                this.minoesPos = [[0, 0], [1, 0], [0, -1], [1, -1]]
                this.srs = {
                    CW: [[]],
                    CCW: [[]]
                }
                break
            case 'S':
                this.color = "rgb(159, 255, 128)"
                this.ghostColor = "rgb(38, 153, 0, 0.5)"
                this.minoesPos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
                break
            case 'T':
                this.color = "rgb(179, 102, 255)"
                this.ghostColor = "rgba(102, 0, 204, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [0, -1]]
                break
            case 'Z':
                this.color = "rgb(255, 51, 51)"
                this.ghostColor = "rgba(204, 0, 0, 0.5)"
                this.minoesPos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
                break
        }
    }
        
    get absMinoesPos() {
        return this.minoesPos.translate(this.pos)
    }

    draw(context, ghostYOffset=0) {
        if (ghostYOffset) {
            context.save()
            context.shadowColor = this.ghostColor
            context.shadowOffsetX = 0
            context.shadowOffsetY  = ghostYOffset * MINO_SIZE
            context.shadowBlur = 3
        }
        this.absMinoesPos.map(pos => draw_mino(context, ...pos, this.color))
        if (ghostYOffset)
            context.restore()
    }
}


function draw_mino(context, x, y, color, ghostYOffset) {
    context.fillStyle = color
    context.fillRect(x*MINO_SIZE, y*MINO_SIZE, MINO_SIZE, MINO_SIZE)
    context.lineWidth = 0.5
    context.strokeStyle = "white"
    context.strokeRect(x*MINO_SIZE, y*MINO_SIZE, MINO_SIZE, MINO_SIZE)
}


class HoldQueue {
    constructor(context) {
        this.context = context
        this.piece = null
        this.width = HOLD_COLUMNS*MINO_SIZE
        this.height = HOLD_ROWS*MINO_SIZE
    }

    draw() {
        this.context.clearRect(0, 0, this.width, this.height)
        if (this.piece)
            this.piece.draw(this.context)
    }
}

timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hourCycle: "h24", timeZone: "UTC"
}).format

class Stats {
    constructor (div, start_level=1) {
        this.div = div
        this._score = 0
        this.highScore = 0
        this.level = start_level - 1
        this.goal = 0
        this.linesCleared = 0
        this.startTime = Date.now()
        this.combo = -1
        this.lockDelay = LOCK_DELAY
        this.fallDelay = FALL_DELAY
    }

    get score() {
        return this._score
    }

    set score(score) {
        this._score = score
        if (score > this.highScore)
            this.highScore = score
    }

    new_level() {
        this.level++
        this.goal += 5 * this.level
        if (this.level <= 20)
            this.fallDelay = 1000 * Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1)
        if (this.level > 15)
            this.lockDelay = 500 * Math.pow(0.9, this.level - 15)
    }

    print() {
        this.div.innerHTML  = this.score
        this.div.innerHTML  += "<br/>" + this.highScore
        this.div.innerHTML  += "<br/>" + this.level
        this.div.innerHTML  += "<br/>" + this.goal
        this.div.innerHTML  += "<br/>" + this.linesCleared
        this.div.innerHTML  += "<br/>" + timeFormat(Date.now() - this.startTime)
    }
}


class Matrix {
    constructor(context) {
        this.context = context
        this.cells = Array.from(Array(MATRIX_COLUMNS), x => Array(MATRIX_ROWS))
        this.width = MATRIX_COLUMNS*MINO_SIZE
        this.height = MATRIX_ROWS*MINO_SIZE
        this.piece = null
    }
    
    cellIsOccupied(x, y) {
        return 0 <= x && x < MATRIX_COLUMNS && y < MATRIX_ROWS ? this.cells[x][y] : true
    }
    
    spaceToMove(absMinoesPos) {
        for (const pos of absMinoesPos) {
            if (this.cellIsOccupied(...pos))
                return false
        }
        return true
    }
    
    draw() {
        this.context.clearRect(0, 0, this.width, this.height)
        // grid
        this.context.strokeStyle = "rgba(128, 128, 128, 128)"
        this.context.lineWidth = 0.5
        this.context.beginPath()
        for (var x = 0; x <= this.width; x += MINO_SIZE) {
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.height);
        }
        for (var y = 0; y <= this.height; y += MINO_SIZE) {
            this.context.moveTo(0, y);
            this.context.lineTo(this.width, y);
        }
        this.context.stroke()
        // falling piece
        if (this.piece)
            for (var ghostYOffset = 0; this.spaceToMove(this.piece.minoesPos.translate([this.piece.pos[0], this.piece.pos[1]+ghostYOffset])); ghostYOffset++) {}
            this.piece.draw(this.context, --ghostYOffset)
    }
}


class NextQueue {
    constructor(context) {
        this.context = context
        this.pieces = Array.from({length: NEXT_PIECES}, (v, k) => new Tetromino(NEXT_PIECES_POSITIONS[k]))
        this.width = NEXT_COLUMNS*MINO_SIZE
        this.height = NEXT_ROWS*MINO_SIZE
    }

    draw() {
        this.context.clearRect(0, 0, this.width, this.height)
        this.pieces.map(piece => piece.draw(this.context))
    }
}


function move(movement) {
    const test_pos = matrix.piece.pos.add(movement)
    if (matrix.spaceToMove(matrix.piece.minoesPos.translate(test_pos))) {
        matrix.piece.pos = test_pos
        return true
    }
    else {
        return false
    }
}

function rotate(spin) {
    const test_minoes_pos = matrix.piece.minoesPos.map(pos => pos.rotate(spin))
    rotation_point = 0
    for (const movement of matrix.piece.srs[spin==SPIN.CW?"CW":"CCW"][matrix.piece.orientation]) {
        const test_pos = matrix.piece.pos.add(movement)
        if (matrix.spaceToMove(test_minoes_pos.translate(test_pos))) {
            matrix.piece.pos = test_pos
            matrix.piece.minoesPos = test_minoes_pos
            matrix.piece.orientation = (matrix.piece.orientation + spin + 4) % 4
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

function hold() {
    if (this.matrix.piece.holdEnabled) {
        this.matrix.piece.holdEnabled = false
        clearInterval(lockPhaseIntervalID)
        var shape = this.matrix.piece.shape
        this.matrix.piece = this.holdQueue.piece
        this.holdQueue.piece = new Tetromino(HELD_PIECE_POSITION, shape)
        this.generationPhase(this.matrix.piece)
    }
}

function new_level() {
    stats.new_level()
    fallIntervalID = setInterval(fall, stats.fallDelay)
    generationPhase()
}

function generationPhase(held_piece=null) {
    if (!held_piece) {
        this.matrix.piece = this.nextQueue.pieces.shift()
        this.nextQueue.pieces.push(new Tetromino())
        this.nextQueue.pieces.map((piece, i, pieces) => piece.pos = NEXT_PIECES_POSITIONS[i])
    }
    this.matrix.piece.pos = FALLING_PIECE_POSITION
    /*if (this.matrix.spaceToMove(this.matrix.piece.minoesPos.translate(this.matrix.piece.pos)))
        fallingPhase()
    else
        gameOver()*/
}

function autorepeat() {
    if (actionsToRepeat.length) {
        actionsToRepeat[0]()
        if (scheduler.timeoutTasks.has(autorepeat)) {
            scheduler.clearTimeout(autorepeat)
            scheduler.setInterval(autorepeat, AUTOREPEAT_PERIOD)
        }
    }
    else {
        scheduler.clearTimeout(autorepeat)
        scheduler.clearInterval(autorepeat)
    }
}

function keyDownHandler(e) {
    if (e.key in actions) {
        if (!pressedKeys.has(e.key)) {
            pressedKeys.add(e.key)
            action = actions[e.key]
            action()
            if (REPEATABLE_ACTIONS.includes(action)) {
                actionsToRepeat.unshift(action)
                scheduler.clearTimeout(autorepeat)
                scheduler.clearInterval(autorepeat)
                if (actionsToRepeat == softDrop)
                    scheduler.setInterval(autorepeat, FALL_DELAY / 20)
                else
                    scheduler.setTimeout(autorepeat, AUTOREPEAT_DELAY)
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
                scheduler.clearTimeout(autorepeat)
                scheduler.clearInterval(autorepeat)
            }
        }
    }
}

function draw() {
    holdQueue.draw()
    stats.print()
    matrix.draw()
    nextQueue.draw()
    requestAnimationFrame(draw)
}

window.onload = function() {
    holdQueue = new HoldQueue(document.getElementById("hold").getContext("2d"))
    stats = new Stats(document.getElementById("stats-values"))
    matrix = new Matrix(document.getElementById("matrix").getContext("2d"))
    nextQueue = new NextQueue(document.getElementById("next").getContext("2d"))
    scheduler = new Scheduler()

    actions = {
        "ArrowLeft":    moveLeft,
        "ArrowRight":   moveRight,
        "ArrowDown":    softDrop,
        " ":            hardDrop,
        "ArrowUp":      rotateCW,
        "z":            rotateCCW,
        "c":            hold
    }
    pressedKeys = new Set()
    actionsToRepeat = []
    addEventListener("keydown", keyDownHandler, false)
    addEventListener("keyup", keyUpHandler, false)
    requestAnimationFrame(draw)

    this.new_level()
}