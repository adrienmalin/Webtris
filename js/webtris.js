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


const NEXT_PIECES =     6
const HOLD_ROWS =       6
const HOLD_COLUMNS =    6
const MATRIX_ROWS =    24
const MATRIX_INVISIBLE_ROWS = 4
const MATRIX_COLUMNS = 10
const NEXT_ROWS =      24
const NEXT_COLUMNS =    6
const LOCKED_PIECE_CLASS = "locked-piece"
const INVISIBLE_ROW_CLASS = "invisible-row"
const VISIBLE_ROW_CLASS = "visible-row"
const CLEARED_LINE_CLASS = "cleared-line"
const TRAIL_CLASS = "trail"
const GHOST_CLASS = "ghost"
const HELD_PIECE_POSITION =    [2, 3]
const FALLING_PIECE_POSITION = [4, 3]
const NEXT_PIECES_POSITIONS =  Array.from({length: NEXT_PIECES}, (v, k) => [2, k*4+3])
const LOCK_DELAY =       500
const FALL_PERIOD =     1000
const AUTOREPEAT_DELAY = 200
const AUTOREPEAT_PERIOD = 10
const ANIMATION_DELAY =  100
const TEMP_TEXTS_DELAY = 700
const MOVEMENT = {
    LEFT:  [-1, 0],
    RIGHT: [ 1, 0],
    DOWN:  [ 0, 1]
}
const SPIN = {
    CW:   1,  // ClockWise
    CCW: -1   // CounterClockWise
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
const T_SLOT_POS = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const SCORES = [
    {linesClearedName: "",       "": 0, "MINI\nT-SPIN": 1, "T-SPIN": 4},
    {linesClearedName: "SINGLE", "": 1, "MINI\nT-SPIN": 2, "T-SPIN": 8},
    {linesClearedName: "DOUBLE", "": 3, "T-SPIN": 12},
    {linesClearedName: "TRIPLE", "": 5, "T-SPIN": 16},
    {linesClearedName: "TETRIS", "": 8},
]
const REPEATABLE_ACTIONS = [moveLeft, moveRight, softDrop]
const STATE = {
    PLAYING: "PLAYING",
    PAUSED: "PAUSE",
    GAME_OVER: "GAME OVER"
}
const actionsDefaultKeys = {
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    softDrop: "ArrowDown",
    hardDrop: " ",
    rotateCW: "ArrowUp",
    rotateCCW: "z",
    hold: "c",
    pause: "Escape",
}
const RETRIES = 3
var actions = {}


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


randomBag = []
class Tetromino {
    constructor(position=null, shape=null) {
        this.pos = position
        this.orientation = 0
        this.rotatedLast = false
        this.rotationPoint5Used = false
        this.holdEnabled = true
        this.locked = false
        this.srs = {}  // Super Rotation System
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
            if (!randomBag.length)
                randomBag = ['tetromino-I', 'tetromino-J', 'tetromino-L', 'tetromino-O', 'tetromino-S', 'tetromino-T', 'tetromino-Z']
            this.shape = randomBag.pick()
        }
        switch(this.shape) {
            case 'tetromino-I':
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
            case 'tetromino-J':
                this.minoesPos = [[-1, -1], [-1, 0], [0, 0], [1, 0]]
            break
            case 'tetromino-L':
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [1, -1]]
            break
            case 'tetromino-O':
                this.minoesPos = [[0, 0], [1, 0], [0, -1], [1, -1]]
                this.srs[SPIN.CW] = [[]]
                this.srs[SPIN.CCW] = [[]]
            break
            case 'tetromino-S':
                this.minoesPos = [[-1, 0], [0, 0], [0, -1], [1, -1]]
            break
            case 'tetromino-T':
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [0, -1]]
            break
            case 'tetromino-Z':
                this.minoesPos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
            break
        }
    }
        
    get minoesAbsPos() {
        return this.minoesPos.translate(this.pos)
    }

    get ghost() {
        var ghost = new Tetromino(Array.from(this.pos), this.shape)
        ghost.minoesPos = Array.from(this.minoesPos)
        ghost.shape = GHOST_CLASS
        return ghost
    }
}


class MinoesTable {
    constructor(id, rows, columns) {
        this.rows = rows
        this.columns = columns
        this.piece = null
        this.table = document.getElementById(id)
    }

    drawMino(x, y, className) {
        this.table.rows[y].cells[x].className = className
    }

    drawPiece(piece) {
        var className = piece.locked ? LOCKED_PIECE_CLASS : piece.shape
        piece.minoesAbsPos.forEach(pos => this.drawMino(...pos, className))
    }

    clearTable() {
        for(var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                this.drawMino(x, y, INVISIBLE_ROW_CLASS)
            }
        }
    }
}

class HoldQueue extends MinoesTable {
    constructor() {
        super("hold", HOLD_ROWS, HOLD_COLUMNS)
    }

    draw() {
        this.clearTable()
        if (this.piece && state != STATE.PAUSED)
            this.drawPiece(this.piece)
    }
}


class Matrix extends MinoesTable {
    constructor() {
        super("matrix", MATRIX_ROWS, MATRIX_COLUMNS)
        this.lockedMinoes = Array.from(Array(MATRIX_ROWS+3), row => Array(MATRIX_COLUMNS))
        this.piece = null
        this.clearedLines = []
        this.trail = {
            minoesPos: [],
            height: 0
        }
    }
    
    cellIsOccupied(x, y) {
        return 0 <= x && x < MATRIX_COLUMNS && y < MATRIX_ROWS ? this.lockedMinoes[y][x] : true
    }
    
    spaceToMove(minoesAbsPos) {
        return !minoesAbsPos.some(pos => this.cellIsOccupied(...pos))
    }
    
    draw() {
        // grid
        if (state == STATE.PAUSED) {
            for (var y = 0; y < this.rows; y++) {
                for (var x = 0; x < this.columns; x++) {
                    if (this.clearedLines.includes(y)) var className = CLEARED_LINE_CLASS
                    else {
                        if (y < MATRIX_INVISIBLE_ROWS) var className = INVISIBLE_ROW_CLASS
                        else var className = VISIBLE_ROW_CLASS
                    }
                    this.drawMino(x, y, className)
                }
            }
        } else {
            for (var y = 0; y < this.rows; y++) {
                for (var x = 0; x < this.columns; x++) {
                    var className = this.lockedMinoes[y][x]
                    if (!className) {
                        if (this.clearedLines.includes(y)) className = CLEARED_LINE_CLASS
                        else {
                            if (y < MATRIX_INVISIBLE_ROWS) className = INVISIBLE_ROW_CLASS
                            else className = VISIBLE_ROW_CLASS
                        }
                    }
                    this.drawMino(x, y, className)
                }
            }

            // trail
            if (this.trail.height) {
                this.trail.minoesPos.forEach(pos => {
                    for (var dy = 0; dy < this.trail.height; dy++) this.drawMino(pos[0], pos[1]+dy, TRAIL_CLASS)
                })
            }
            
            //ghost
            if (!this.piece.locked && state != STATE.GAME_OVER) {
                for (var ghost = this.piece.ghost; this.spaceToMove(ghost.minoesAbsPos); ghost.pos[1]++) {}
                ghost.pos[1]--
                this.drawPiece(ghost)
            }

            this.drawPiece(this.piece)
        }
    }
}


class NextQueue extends MinoesTable {
    constructor() {
        super("next", NEXT_ROWS, NEXT_COLUMNS)
        this.pieces = Array.from({length: NEXT_PIECES}, (v, k) => new Tetromino(NEXT_PIECES_POSITIONS[k]))
    }

    draw() {
        this.clearTable()
        if (state != STATE.PAUSED) {
            this.pieces.forEach(piece => this.drawPiece(piece))
        }
    }
}


timeFormat = new Intl.DateTimeFormat("fr-FR", {
    minute: "2-digit", second: "2-digit", hourCycle: "h24", timeZone: "UTC"
}).format


class Stats {
    constructor () {
        this.scoreCell = document.getElementById("score")
        this.highScoreCell = document.getElementById("highScore")
        this.timeCell = document.getElementById("time")
        this.levelCell = document.getElementById("level")
        this.goalCell = document.getElementById("goal")
        this.clearedLinesCell = document.getElementById("clearedLines")
        this._score = 0
        this.highScore = localStorage.getItem('highScore') || 0
        this.goal = 0
        this.clearedLines = 0
        this.startTime = Date.now()
        this.pauseTime = 0
        this.combo = -1
        this.lockDelay = LOCK_DELAY
        this.fallPeriod = FALL_PERIOD
    }

    get score() {
        return this._score
    }

    set score(score) {
        this._score = score
        this.scoreCell.innerHTML = this._score
        if (score > this.highScore)
            this.highScore = score
            this.highScoreCell.innerHTML = this.highScore
    }

    newLevel(level=null) {
        if (level)
            this.level = level
        else
            this.level++
        this.levelCell.innerHTML = this.level
        printTempTexts(`LEVEL<br/>${this.level}`)
        this.goal += 5 * this.level
        this.goalCell.innerHTML = this.goal
        if (this.level <= 20)
            this.fallPeriod = 1000 * Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1)
        if (this.level > 15)
            this.lockDelay = 500 * Math.pow(0.9, this.level - 15)
    }

    lockDown(tSpin, clearedLines) {
        var patternName = []
        var patternScore = 0
        var combo_score = 0
        
        if (tSpin)
            patternName.push(tSpin)
        if (clearedLines) {
            patternName.push(SCORES[clearedLines].linesClearedName)
            this.combo++
        } else
            this.combo = -1

        if (clearedLines || tSpin) {
            this.clearedLines += clearedLines
            this.clearedLinesCell.innerHTML = clearedLines
            patternScore = SCORES[clearedLines][tSpin]
            this.goal -= patternScore
            this.goalCell.innerHTML = this.goal
            patternScore *= 100 * this.level
            patternName = patternName.join("\n")
        }
        if (this.combo >= 1)
            combo_score = (clearedLines == 1 ? 20 : 50) * this.combo * this.level

        this.score += patternScore + combo_score

        if (patternScore) {
            var messages = [patternName, patternScore]
            if (combo_score)
                messages.push(`COMBO x${this.combo}`, combo_score)
                printTempTexts(messages.join("<br/>"))
        }
    }

    printTime() {
        this.timeCell.innerHTML = timeFormat(Date.now() - this.startTime)
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
    nextQueue.draw()
    matrix.piece.pos = FALLING_PIECE_POSITION
    if (matrix.spaceToMove(matrix.piece.minoesPos.translate(matrix.piece.pos))){
        scheduler.clearInterval(lockPhase)
        scheduler.setInterval(lockPhase, stats.fallPeriod)
        fallingPhase()
    } else
        gameOver()
}

function fallingPhase() {
    scheduler.clearTimeout(lockDown)
    matrix.piece.locked = false
    matrix.draw()
}

function lockPhase() {
    move(MOVEMENT.DOWN)
}

function move(movement, testMinoesPos=matrix.piece.minoesPos, hardDrop=false) {
    const testPos = matrix.piece.pos.add(movement)
    if (matrix.spaceToMove(testMinoesPos.translate(testPos))) {
        matrix.piece.pos = testPos
        matrix.piece.minoesPos = testMinoesPos
        if (movement != MOVEMENT.DOWN)
            matrix.piece.rotatedLast = false
        if (matrix.spaceToMove(matrix.piece.minoesPos.translate(matrix.piece.pos.add(MOVEMENT.DOWN))))
            fallingPhase()
        else if (!hardDrop) {
            matrix.piece.locked = true
            scheduler.clearTimeout(lockDown)
            scheduler.setTimeout(lockDown, stats.lockDelay)
        }
        if (!hardDrop)
            matrix.draw()
        return true
    } else {
        if (movement == MOVEMENT.DOWN) {
            matrix.piece.locked = true
            if (!scheduler.timeoutTasks.has(lockDown))
                scheduler.setTimeout(lockDown, stats.lockDelay)
            matrix.draw()
        }
        return false
    }
}

function rotate(spin) {
    const test_minoes_pos = matrix.piece.minoesPos.map(pos => pos.rotate(spin))
    rotationPoint = 1
    for (const movement of matrix.piece.srs[spin][matrix.piece.orientation]) {
        if (move(movement, test_minoes_pos)) {
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

function lockDown(){
    scheduler.clearInterval(lockPhase)
    if (matrix.piece.minoesAbsPos.every(pos => pos[1] < MATRIX_INVISIBLE_ROWS)) {
        matrix.piece.locked = false
        matrix.draw()
        gameOver()
    } else {
        matrix.piece.minoesAbsPos.forEach(pos => matrix.lockedMinoes[pos[1]][pos[0]] = matrix.piece.shape)

        // T-Spin detection
        var tSpin = T_SPIN.NONE
        if (matrix.piece.rotatedLast && matrix.piece.shape == "tetromino-T") {
            const tSlots = T_SLOT_POS.translate(matrix.piece.pos).map(pos => matrix.cellIsOccupied(...pos)),
                  a = tSlots[(matrix.piece.orientation+T_SLOT.A)%4],
                  b = tSlots[(matrix.piece.orientation+T_SLOT.B)%4],
                  c = tSlots[(matrix.piece.orientation+T_SLOT.C)%4],
                  d = tSlots[(matrix.piece.orientation+T_SLOT.D)%4]
            if (a && b && (c || d))
                tSpin = T_SPIN.T_SPIN
            else if (c && d && (a || b))
                tSpin = matrix.piece.rotationPoint5Used ? T_SPIN.T_SPIN : T_SPIN.MINI
        }

        // Complete lines
        matrix.clearedLines = []
        matrix.lockedMinoes.forEach((row, y) => {
            if (row.filter(lockedMino => lockedMino.length).length == MATRIX_COLUMNS) {
                matrix.lockedMinoes.splice(y, 1)
                matrix.lockedMinoes.unshift(Array(MATRIX_COLUMNS))
                matrix.clearedLines.push(y)
            }
        })

        stats.lockDown(tSpin, matrix.clearedLines.length)
        matrix.draw()
        scheduler.setTimeout(clearLinesCleared, ANIMATION_DELAY)

        if (stats.goal <= 0)
            newLevel()
        else
            generationPhase()
    }
}

function clearLinesCleared() {
    matrix.clearedLines = []
    matrix.draw()
}

function gameOver() {
    state = STATE.GAME_OVER
    messageDiv.innerHTML = "GAME<br/>OVER"
    scheduler.clearInterval(lockPhase)
    scheduler.clearTimeout(lockDown)
    scheduler.clearInterval(clock)

    var info = `GAME OVER\nScore : ${stats.score}`
    if (stats.score == stats.highScore) {
        localStorage.setItem('highScore', stats.highScore)
        info += "\nBravo ! Vous avez battu votre précédent record."
    }

    var retry = 0
    var XHR = new XMLHttpRequest()
    var FD  = new FormData()
    FD.append("score", stats.score)
    XHR.addEventListener('load', function(event) {
        if (event.target.responseText == "true") {
            var player = prompt(info + "\nBravo ! Vous êtes dans le Top 10.\nEntrez votre nom pour publier votre score :" , localStorage.getItem("name") || "")
            if (player.length) {
                localStorage.setItem("player", player)
                XHR = new XMLHttpRequest()
                FD  = new FormData()
                FD.append("player", player)
                FD.append("score", stats.score)
                XHR.addEventListener('load', function(event) {
                    open("leaderboard.php")
                })
                XHR.addEventListener('error', function(event) {
                    if (confirm('Erreur de connexion.\nRéessayer ?'))
                        XHR.send(FD)
                })
                XHR.open('POST', 'publish.php')
                XHR.send(FD)
            }
        } else {
            retry++
            if (retry < RETRIES)
                XHR.send(FD)
            else
                alert(info)
        }
    })
    XHR.addEventListener('error', function(event) {
        alert(info)
    })
    XHR.open('POST', 'inleaderboard.php')
    XHR.send(FD)
}

function autorepeat() {
    if (actionsToRepeat.length) {
        actionsToRepeat[0]()
        if (scheduler.timeoutTasks.has(autorepeat)) {
            scheduler.clearTimeout(autorepeat)
            scheduler.setInterval(autorepeat, AUTOREPEAT_PERIOD)
        }
    } else {
        scheduler.clearTimeout(autorepeat)
        scheduler.clearInterval(autorepeat)
    }
}

function keyDownHandler(e) {
    if (e.key in actions[state])
        e.preventDefault()
    if (!pressedKeys.has(e.key)) {
        pressedKeys.add(e.key)
        if (e.key in actions[state]) {
            action = actions[state][e.key]
            action()
            if (REPEATABLE_ACTIONS.includes(action)) {
                actionsToRepeat.unshift(action)
                scheduler.clearTimeout(autorepeat)
                scheduler.clearInterval(autorepeat)
                if (action == softDrop)
                    scheduler.setInterval(autorepeat, stats.fallPeriod / 20)
                else
                    scheduler.setTimeout(autorepeat, AUTOREPEAT_DELAY)
            }
        }
    }
}

function keyUpHandler(e) {
    pressedKeys.delete(e.key)
    if (e.key in actions[state]) {
        action = actions[state][e.key]
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
    scheduler.clearInterval(lockPhase)
    scheduler.clearTimeout(lockDown)
    matrix.trail.minoesPos = Array.from(matrix.piece.minoesAbsPos)
    for (matrix.trail.height = 0; move(MOVEMENT.DOWN); matrix.trail.height++) {
        stats.score += 2
    }
    while (move(MOVEMENT.DOWN, matrix.piece.minoesPos, true)) {}
    matrix.draw()
    lockDown()
    scheduler.setTimeout(clearTrail, ANIMATION_DELAY)
}

function clearTrail() {
    matrix.trail.height = 0
    matrix.draw()
}

function rotateCW() {
    rotate(SPIN.CW)
}

function rotateCCW() {
    rotate(SPIN.CCW)
}

function hold() {
    if (matrix.piece.holdEnabled) {
        scheduler.clearInterval(move)
        scheduler.clearInterval(lockDown)
        var shape = matrix.piece.shape
        matrix.piece = holdQueue.piece
        holdQueue.piece = new Tetromino(HELD_PIECE_POSITION, shape)
        holdQueue.piece.holdEnabled = false
        holdQueue.draw()
        generationPhase(matrix.piece)
        matrix.piece.holdEnabled = false
    }
}

function pause() {
    state = STATE.PAUSED
    stats.pauseTime = Date.now() - stats.startTime
    messageDiv.innerHTML = "PAUSED"
    scheduler.clearInterval(lockPhase)
    scheduler.clearTimeout(lockDown)
    scheduler.clearTimeout(autorepeat)
    scheduler.clearInterval(clock)
    holdQueue.draw()
    matrix.draw()
    nextQueue.draw()
}

function resume() {
    state = STATE.PLAYING
    stats.startTime = Date.now() - stats.pauseTime
    messageDiv.innerHTML = ""
    scheduler.setTimeout(lockPhase, stats.fallPeriod)
    if (matrix.piece.locked)
        scheduler.setTimeout(lockDown, stats.lockDelay)
    scheduler.setInterval(clock, 1000)
    hold.draw()
    matrix.draw()
    next.draw()
}

function printTempTexts(texts) {
    tempTexts.push(texts)
    messageDiv.innerHTML = tempTexts[0]
    if (!scheduler.intervalTasks.has(delTempTexts))
        scheduler.setInterval(delTempTexts, TEMP_TEXTS_DELAY)
}

function delTempTexts(self) {
    if (tempTexts.length) 
        tempTexts.shift()
    if (tempTexts.length) 
        messageDiv.innerHTML = tempTexts[0]
    else {
        scheduler.clearInterval(delTempTexts)
        messageDiv.innerHTML = ""
    }
}

function getKey(action) {
    return localStorage.getItem(action) || actionsDefaultKeys[action]
}

function clock() {
    stats.printTime()
}

window.onload = function() {
    tempTexts = []
    messageDiv = document.getElementById("message")

    holdQueue = new HoldQueue()
    stats = new Stats()
    matrix = new Matrix()
    nextQueue = new NextQueue()
    
    actions[STATE.PLAYING] = {}
    actions[STATE.PLAYING][getKey("moveLeft")] = moveLeft
    actions[STATE.PLAYING][getKey("moveRight")] = moveRight
    actions[STATE.PLAYING][getKey("softDrop")] = softDrop
    actions[STATE.PLAYING][getKey("hardDrop")] = hardDrop
    actions[STATE.PLAYING][getKey("rotateCW")] = rotateCW
    actions[STATE.PLAYING][getKey("rotateCCW")] = rotateCCW
    actions[STATE.PLAYING][getKey("hold")] = hold
    actions[STATE.PLAYING][getKey("pause")] = pause
    actions[STATE.PAUSED] = {}
    actions[STATE.PAUSED][getKey("pause")] = resume
    actions[STATE.GAME_OVER] = {}
    pressedKeys = new Set()
    actionsToRepeat = []
    addEventListener("keydown", keyDownHandler, false)
    addEventListener("keyup", keyUpHandler, false)

    state = STATE.PLAYING
    scheduler = new Scheduler()
    scheduler.setInterval(clock, 1000)
    newLevel(1)
}