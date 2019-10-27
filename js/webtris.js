Array.prototype.add = function(other) {
    return this.map((x, i) => x + other[i])
}

Array.prototype.mul = function(k) {
    return this.map(x => k * x)
}

Array.prototype.translate = function(vector) {
    return this.map(pos => pos.add(vector))
}

Array.prototype.rotate = function(spin) {
    return [-spin*this[1], spin*this[0]]
}

Array.prototype.pick = function() {
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
const AUTOREPEAT_DELAY = 250
const AUTOREPEAT_PERIOD = 10
const TEMP_TEXTS_DELAY = 700
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
    NONE: "",
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
    {linesClearedName: "",       "": 0, "MINI\nT-SPIN": 1, "T-SPIN": 4},
    {linesClearedName: "SINGLE", "": 1, "MINI\nT-SPIN": 2, "T-SPIN": 8},
    {linesClearedName: "DOUBLE", "": 3, "T-SPIN": 12},
    {linesClearedName: "TRIPLE", "": 5, "T-SPIN": 16},
    {linesClearedName: "TETRIS", "": 8},
]
const REPEATABLE_ACTIONS = [moveLeft, moveRight, softDrop]
const T_SLOT_POS = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const STATE = {
    PLAYING: "PLAYING",
    PAUSED: "PAUSE",
    GAME_OVER: "GAME OVER"
}
var ACTIONS = {}
ACTIONS[STATE.PLAYING] = {
    "ArrowLeft":    moveLeft,
    "ArrowRight":   moveRight,
    "ArrowDown":    softDrop,
    " ":            hardDrop,
    "ArrowUp":      rotateCW,
    "z":            rotateCCW,
    "c":            hold,
    "Escape":       pause
}
ACTIONS[STATE.PAUSED] = {
    "Escape":        resume
}
ACTIONS[STATE.GAME_OVER] = {}


class Scheduler {
    constructor() {
        this.intervalTasks = new Map()
        this.timeoutTasks = new Map()
    }

    setInterval(func, delay, ...args) {
        this.intervalTasks.set(func, window.setInterval(func, delay, ...args))
    }

    setTimeout(func, delay, ...args) {
        this.timeoutTasks.set(func, window.setTimeout(func, delay, ...args))
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
        this.locked = false
        this.srs = {}
        this.srs[SPIN.CW] = [
            [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]],
            [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]],
            [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]],
            [[0, 0], [-1, 0], [-1,  1], [0, -2], [-1, -2]],
        ]
        this.srs[SPIN.CCW] = [
            [[0, 0], [ 1, 0], [ 1, -1], [0,  2], [ 1,  2]],
            [[0, 0], [ 1, 0], [ 1,  1], [0, -2], [ 1, -2]],
            [[0, 0], [-1, 0], [-1, -1], [0,  2], [-1,  2]],
            [[0, 0], [-1, 0], [-1,  1], [0,  2], [-1, -2]],
        ]
        if (shape)
            this.shape = shape
        else {
            if (!shapes.length)
                shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']
            this.shape = shapes.pick()
        }
        switch(this.shape) {
            case 'I':
                this.color = "cyan"
                this.lightColor = "rgb(234, 250, 250)"
                this.ghostColor = "rgba(234, 250, 250, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [2, 0]]
                this.srs[SPIN.CW] = [
                    [[ 1,  0], [-1,  0], [ 2,  0], [-1,  1], [ 2, -2]],
                    [[ 0,  1], [-1,  1], [ 2,  1], [-1, -1], [ 2,  2]],
                    [[-1,  0], [ 1,  0], [-2,  0], [ 1, -1], [-2,  2]],
                    [[ 0,  1], [ 1, -1], [-2, -1], [ 1,  1], [-2, -2]],
                ]
                this.srs[SPIN.CCW] = [
                    [[ 0,  1], [-1,  1], [ 2,  1], [-1, -1], [ 2,  2]],
                    [[-1,  0], [ 1,  0], [-2,  0], [ 1, -1], [-2,  2]],
                    [[ 0, -1], [ 1, -1], [-2, -1], [ 1,  1], [-2, -2]],
                    [[ 1,  0], [-1,  0], [ 2,  0], [-1,  1], [ 2, -2]],
                ]
                break
            case 'J':
                this.color = "blue"
                this.lightColor = "rgb(230, 240, 255)"
                this.ghostColor = "rgba(230, 240, 255, 0.5)"
                this.minoesPos = [[-1, -1], [-1, 0], [0, 0], [1, 0]]
                break
            case 'L':
                this.color = "orange"
                this.lightColor = "rgb(255, 224, 204)"
                this.ghostColor = "rgba(255, 224, 204, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [1, -1]]
                break
            case 'O':
                this.color = "yellow"
                this.lightColor = "rgb(255, 255, 230)"
                this.ghostColor = "rgba(255, 255, 230, 0.5)"
                this.minoesPos = [[0, 0], [1, 0], [0, -1], [1, -1]]
                this.srs[SPIN.CW] = [[]]
                this.srs[SPIN.CCW] = [[]]
                break
            case 'S':
                this.color = "green"
                this.lightColor = "rgb(236, 255, 230)"
                this.ghostColor = "rgba(236, 255, 230, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [0, -1], [1, -1]]
                break
            case 'T':
                this.color = "magenta"
                this.lightColor= "rgb(242, 230, 255)"
                this.ghostColor = "rgba(242, 230, 255, 0.5)"
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [0, -1]]
                break
            case 'Z':
                this.color = "red"
                this.lightColor = "rgb(255, 230, 230)"
                this.ghostColor = "rgba(255, 230, 230, 0.5)"
                this.minoesPos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
                break
        }
    }
        
    get minoesAbsPos() {
        return this.minoesPos.translate(this.pos)
    }

    draw(context, ghost_pos=[0, 0]) {
        const color = this.locked ? this.lightColor : this.color
        if (ghost_pos[1]) {
            context.save()
            context.shadowColor = this.ghostColor
            context.shadowOffsetX = 0
            context.shadowOffsetY = (ghost_pos[1]-this.pos[1]) * MINO_SIZE
            context.shadowBlur = 3
            this.minoesAbsPos.forEach(pos => drawMino(context, pos, color))
            context.restore()
        }
        this.minoesAbsPos.forEach(pos => drawMino(context, pos, this.lightColor, color, ghost_pos))
    }
}


function drawMino(context, pos, color1, color2=null, spotlight=[0, 0]) {
    if (color2) {
        var center = pos.add([0.5, 0.5])
        spotlight = spotlight.add([0.5, 0.5])
        var glint = spotlight.mul(0.1).add(center.mul(0.9)).mul(MINO_SIZE)
        const gradient = context.createRadialGradient(
            ...glint, 2, ...glint.add([6, 4]), 2*MINO_SIZE
        )
        gradient.addColorStop(0, color1)
        gradient.addColorStop(1, color2)
        context.fillStyle = gradient
    }
    else
        context.fillStyle = color1
    var topLeft = pos.mul(MINO_SIZE)
    context.fillRect(...topLeft, MINO_SIZE, MINO_SIZE)
    context.lineWidth = 0.5
    context.strokeStyle = "white"
    context.strokeRect(...topLeft, MINO_SIZE, MINO_SIZE)
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
        if (state != STATE.PAUSED) {
            if (this.piece)
                this.piece.draw(this.context)
        }
    }
}


timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hourCycle: "h24", timeZone: "UTC"
}).format


class Stats {
    constructor (div) {
        this.div = div
        this._score = 0
        this.highScore = 0
        this.goal = 0
        this.linesCleared = 0
        this.startTime = Date.now()
        this.pauseTime = 0
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

    newLevel(level=null) {
        if (level)
            this.level = level
        else
            this.level++
        printTempTexts(["LEVEL", this.level])
        this.goal += 5 * this.level
        if (this.level <= 20)
            this.fallDelay = 1000 * Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1)
        if (this.level > 15)
            this.lockDelay = 500 * Math.pow(0.9, this.level - 15)
    }

    locksDown(tSpin, linesCleared) {
        var pattern_name = []
        var pattern_score = 0
        var combo_score = 0
        
        if (tSpin)
            pattern_name.push(tSpin)
        if (linesCleared) {
            pattern_name.push(SCORES[linesCleared].linesClearedName)
            this.combo++
        }
        else
            this.combo = -1

        if (linesCleared || tSpin) {
            pattern_score = SCORES[linesCleared][tSpin]
            this.goal -= pattern_score
            pattern_score *= 100 * this.level
            pattern_name = pattern_name.join("\n")
        }
        if (this.combo >= 1)
            combo_score = (linesCleared == 1 ? 20 : 50) * this.combo * this.level

        this.score += pattern_score + combo_score

        if (pattern_score)
            printTempTexts([pattern_name, pattern_score])
        if (combo_score)
            printTempTexts(["COMBO x" + this.combo, combo_score])
    }

    print() {
        this.div.innerHTML  = this.score + "<br/>"
                            + this.highScore + "<br/>"
                            + this.level + "<br/>"
                            + this.goal + "<br/>"
                            + this.linesCleared + "<br/>"
                            + timeFormat(Date.now() - this.startTime)
    }
}


class Matrix {
    constructor(context) {
        this.context = context
        this.context.textAlign = "center"
        this.context.textBaseline = "center"
        this.context.font = "3vw 'Share Tech', sans-serif"
        this.cells = Array.from(Array(MATRIX_ROWS+3), row => Array(MATRIX_COLUMNS))
        this.width = MATRIX_COLUMNS*MINO_SIZE
        this.height = MATRIX_ROWS*MINO_SIZE
        this.centerX = this.width / 2
        this.centerY = this.height / 2
        this.piece = null
    }
    
    cellIsOccupied(x, y) {
        return 0 <= x && x < MATRIX_COLUMNS && y < MATRIX_ROWS ? this.cells[y+3][x] : true
    }
    
    spaceToMove(minoesAbsPos) {
        return !minoesAbsPos.some(pos => this.cellIsOccupied(...pos))
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

        if (state != STATE.PAUSED) {
            // ghost position
            for (var ghost_pos = Array.from(this.piece.pos); this.spaceToMove(this.piece.minoesPos.translate(ghost_pos)); ghost_pos[1]++) {}
            ghost_pos[1]--

            // locked minoes
            this.cells.slice(3).forEach((row, y) => row.forEach((colors, x) => {
                if (colors) drawMino(this.context, [x, y], ...colors, ghost_pos)
            }))
            
            // falling piece
            if (this.piece)
                this.piece.draw(this.context, ghost_pos)
        }

        // text
        var texts = []
        switch(state) {
            case STATE.PLAYING:
                if (tempTexts.length)
                    texts = tempTexts[0]
                break
            case STATE.PAUSED:
                texts = ["PAUSED"]
                break
            case STATE.GAME_OVER:
                texts = ["GAME", "OVER"]
        }
        if (texts.length) {
            this.context.save()
            this.context.shadowColor = "black"
            this.context.shadowOffsetX = 1
            this.context.shadowOffsetY = 1
            this.context.shadowBlur = 2
            this.context.fillStyle = "white"
            if (texts.length == 1)
                this.context.fillText(texts[0], this.centerX, this.centerY)
            else {
                this.context.fillText(texts[0], this.centerX, this.centerY - 20)
                this.context.fillText(texts[1], this.centerX, this.centerY + 20)
            }
            this.context.restore()
        }
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
        if (state != STATE.PAUSED) {
            this.pieces.forEach(piece => piece.draw(this.context))
        }
    }
}


function newLevel(startLevel) {
    stats.newLevel(startLevel)
    generationPhase()
}

function generationPhase(held_piece=null) {
    if (!held_piece) {
        matrix.piece = nextQueue.pieces.shift()
        nextQueue.pieces.push(new Tetromino())
        nextQueue.pieces.forEach((piece, i) => piece.pos = NEXT_PIECES_POSITIONS[i])
    }
    matrix.piece.pos = FALLING_PIECE_POSITION
    if (matrix.spaceToMove(matrix.piece.minoesPos.translate(matrix.piece.pos)))
        fallingPhase()
    else
        gameOver()
}

function fallingPhase() {
    scheduler.clearTimeout(lockPhase)
    scheduler.clearTimeout(locksDown)
    matrix.piece.locked = false
    scheduler.setTimeout(lockPhase, stats.fallDelay)
}

function lockPhase() {
    if (!move(MOVEMENT.DOWN))
        locksDown()
    requestAnimationFrame(draw)
}

function move(movement, lock=true, testMinoesPos=matrix.piece.minoesPos) {
    const testPos = matrix.piece.pos.add(movement)
    if (matrix.spaceToMove(testMinoesPos.translate(testPos))) {
        matrix.piece.pos = testPos
        matrix.piece.minoesPos = testMinoesPos
        if (movement != MOVEMENT.DOWN)
            matrix.piece.rotatedLast = false
        if (matrix.spaceToMove(matrix.piece.minoesPos.translate(matrix.piece.pos.add(MOVEMENT.DOWN))))
            fallingPhase()
        else {
            scheduler.clearTimeout(locksDown)
            if (lock) {
                matrix.piece.locked = true
                scheduler.setTimeout(locksDown, stats.lockDelay)
            }
        }
        return true
    }
    else {
        return false
    }
}

function rotate(spin) {
    const test_minoes_pos = matrix.piece.minoesPos.map(pos => pos.rotate(spin))
    rotationPoint = 1
    for (const movement of matrix.piece.srs[spin][matrix.piece.orientation]) {
        if (move(movement, false, test_minoes_pos)) {
            matrix.piece.orientation = (matrix.piece.orientation + spin + 4) % 4
            matrix.piece.rotatedLast = true
            if (rotationPoint == 5)
                matrix.piece.rotationPoint5Used = true
            return true
        }
        rotationPoint++
    }
    return false
}

function locksDown(){
    scheduler.clearInterval(move)
    if (matrix.piece.minoesAbsPos.every(pos => pos.y < 0))
        game_over()
    else {
        matrix.piece.minoesAbsPos.forEach(pos => matrix.cells[pos[1]+3][pos[0]] = [matrix.piece.lightColor, matrix.piece.color])

        // T-Spin detection
        var tSpin = T_SPIN.NONE
        const tSlots = T_SLOT_POS.translate(matrix.piece.pos).map(pos => matrix.cellIsOccupied(pos))
        if (matrix.piece.rotatedLast && matrix.piece.shape == "T") {
            const a = tSlots[(matrix.piece.orientation+T_SLOT.A)%4],
                  b = tSlots[(matrix.piece.orientation+T_SLOT.B)%4],
                  c = tSlots[(matrix.piece.orientation+T_SLOT.C)%4],
                  d = tSlots[(matrix.piece.orientation+T_SLOT.D)%4]
            if (a && b && (c || d))
                tSpin = T_SPIN.T_SPIN
            else if (c && d && (a || b))
                tSpin = matrix.piece.rotationPoint5Used ? T_SPIN.T_SPIN : T_SPIN.MINI
        }

        // Complete lines
        var linesCleared = 0
        matrix.cells.forEach((row, y) => {
            if (row.filter(mino => mino.length).length == MATRIX_COLUMNS) {
                matrix.cells.splice(y, 1)
                matrix.cells.unshift(Array(MATRIX_COLUMNS))
                linesCleared++
            }
        })

        stats.locksDown(tSpin, linesCleared)

        if (stats.goal <= 0)
            newLevel()
        else
            generationPhase()
    }
}

function gameOver() {
    state = STATE.GAME_OVER
    scheduler.clearTimeout(lockPhase)
    scheduler.clearTimeout(locksDown)
    scheduler.clearInterval(clock)
    requestAnimationFrame(draw)
}

function autorepeat() {
    if (actionsToRepeat.length) {
        actionsToRepeat[0]()
        requestAnimationFrame(draw)
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
    if (!pressedKeys.has(e.key)) {
        pressedKeys.add(e.key)
        if (e.key in ACTIONS[state]) {
            action = ACTIONS[state][e.key]
            action()
            requestAnimationFrame(draw)
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
    pressedKeys.delete(e.key)
    if (e.key in ACTIONS[state]) {
        action = ACTIONS[state][e.key]
        if (actionsToRepeat.includes(action)) {
            actionsToRepeat.splice(actionsToRepeat.indexOf(action), 1)
            if (!actionsToRepeat.length) {
                scheduler.clearTimeout(autorepeat)
                scheduler.clearInterval(autorepeat)
            }
        }
    }
}

function moveLeft() {
    move(MOVEMENT.LEFT);
}

function moveRight() {
    move(MOVEMENT.RIGHT)
}

function softDrop() {
    if (move(MOVEMENT.DOWN))
        stats.score++
}

function hardDrop() {
    scheduler.clearTimeout(lockPhase)
    scheduler.clearTimeout(locksDown)
    while(move(MOVEMENT.DOWN, false)) {
        stats.score += 2
    }
    locksDown()
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
        scheduler.clearInterval(move)
        scheduler.clearInterval(locksDown)
        var shape = this.matrix.piece.shape
        this.matrix.piece = this.holdQueue.piece
        this.holdQueue.piece = new Tetromino(HELD_PIECE_POSITION, shape)
        this.generationPhase(this.matrix.piece)
    }
}

function pause() {
    state = STATE.PAUSED
    stats.pauseTime = Date.now() - stats.startTime
    scheduler.clearTimeout(lockPhase)
    scheduler.clearTimeout(locksDown)
    scheduler.clearTimeout(autorepeat)
    scheduler.clearInterval(clock)
}

function resume() {
    state = STATE.PLAYING
    stats.startTime = Date.now() - stats.pauseTime
    scheduler.setTimeout(lockPhase, stats.fallDelay)
    if (matrix.piece.locked)
        scheduler.setTimeout(locksDown, stats.lockDelay)
    requestAnimationFrame(draw)
    scheduler.setInterval(clock, 1000)
}

function printTempTexts(texts) {
    tempTexts.push(texts)
    if (!scheduler.intervalTasks.has(delTempTexts))
        scheduler.setInterval(delTempTexts, TEMP_TEXTS_DELAY)
}

function delTempTexts(self) {
    if (tempTexts.length)
        tempTexts.shift()
    else
        scheduler.clearInterval(delTempTexts)
}

function clock() {
    stats.print()
}

function draw() {
    holdQueue.draw()
    stats.print()
    matrix.draw()
    nextQueue.draw()
}

window.onload = function() {
    tempTexts = []

    holdQueue = new HoldQueue(document.getElementById("hold").getContext("2d"))
    stats = new Stats(document.getElementById("stats-values"))
    matrix = new Matrix(document.getElementById("matrix").getContext("2d"))
    nextQueue = new NextQueue(document.getElementById("next").getContext("2d"))
    
    pressedKeys = new Set()
    actionsToRepeat = []
    addEventListener("keydown", keyDownHandler, false)
    addEventListener("keyup", keyUpHandler, false)

    state = STATE.PLAYING
    scheduler = new Scheduler()
    scheduler.setInterval(clock, 1000)
    this.newLevel(1)
}