// Customize Array to be use as coordinates
Object.defineProperty(Array.prototype, "x", {
    get: function () { return this[0] },
    set: function (x) { this[0] = x}
})
Object.defineProperty(Array.prototype, "y", {
    get: function () { return this[1] },
    set: function (y) { this[1] = y}
})
Array.prototype.add =       function(other)  { return this.map((x, i) => x + other[i]) }
Array.prototype.mul =       function(k)      { return this.map(x => k * x) }
Array.prototype.translate = function(vector) { return this.map(pos => pos.add(vector)) }
Array.prototype.rotate =    function(spin)   { return [-spin*this.y, spin*this.x] }
Array.prototype.pick =      function()       { return this.splice(Math.floor(Math.random()*this.length), 1)[0] }

// Constants
const NEXT_PIECES = 6
const HOLD = {
    PIECE_POSITION: [2, 3]
}
const MATRIX = {
    INVISIBLE_ROWS: 4,
    PIECE_POSITION: [4, 3]
}
const NEXT= {
    PIECE_POSITION: Array.from({length: NEXT_PIECES}, (v, k) => [2, k*4+3])
}
const THEME = {
    PIECE_POSITION: [1, 1]
}
const CLASSNAME = {
    EMPTY_CELL: "empty-cell",
    MINO: "mino",
    LOCKED: "locked-mino",
    TRAIL: "trail",
    GHOST: "ghost",
    CLEARED_LINE: "mino cleared-line"
}
const DELAY = {
    LOCK: 500,
    FALL: 1000,
    autorepeat: 300,
    AUTOREPEAT_PERIOD: 10,
    ANIMATION: 100,
    MESSAGE: 700
}
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
    MINI: "MINI T-SPIN",
    T_SPIN: "T-SPIN"
}
const T_SLOT = {
    A: 0,
    B: 1,
    C: 3,
    D: 2
}
const T_SLOT_POS = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1]
]
const SCORES = [
    {linesClearedName: "",       "": 000, "MINI T-SPIN": 100, "T-SPIN": 400},
    {linesClearedName: "SINGLE", "": 100, "MINI T-SPIN": 200, "T-SPIN": 800},
    {linesClearedName: "DOUBLE", "": 300, "T-SPIN": 1200},
    {linesClearedName: "TRIPLE", "": 500, "T-SPIN": 1600},
    {linesClearedName: "TETRIS", "": 800},
]
const REPEATABLE_ACTIONS = [moveLeft, moveRight, softDrop]
const STATE = {
    WAITING: "WAITING",
    PLAYING: "PLAYING",
    PAUSED: "PAUSE",
    GAME_OVER: "GAME OVER",
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
const DEFAULT_THEME = "light-relief"


// Classes
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
                randomBag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']
            this.shape = randomBag.pick()
        }
        switch(this.shape) {
            case 'I':
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
                this.minoesPos = [[-1, -1], [-1, 0], [0, 0], [1, 0]]
            break
            case 'L':
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [1, -1]]
            break
            case 'O':
                this.minoesPos = [[0, 0], [1, 0], [0, -1], [1, -1]]
                this.srs[SPIN.CW] = [[]]
                this.srs[SPIN.CCW] = [[]]
            break
            case 'S':
                this.minoesPos = [[-1, 0], [0, 0], [0, -1], [1, -1]]
            break
            case 'T':
                this.minoesPos = [[-1, 0], [0, 0], [1, 0], [0, -1]]
            break
            case 'Z':
                this.minoesPos = [[-1, -1], [0, -1], [0, 0], [1, 0]]
            break
        }
        this.className = CLASSNAME.MINO + " " + this.shape + "-" + CLASSNAME.MINO
    }
        
    get minoesAbsPos() {
        return this.minoesPos.translate(this.pos)
    }

    get ghost() {
        var ghost = new Tetromino(Array.from(this.pos), this.shape)
        ghost.minoesPos = Array.from(this.minoesPos)
        ghost.className = CLASSNAME.GHOST
        return ghost
    }
}


class MinoesTable {
    constructor(id) {
        this.table = document.getElementById(id)
        this.rows = this.table.rows.length
        this.columns = this.table.rows[0].childElementCount
    }

    drawMino(x, y, className) {
        this.table.rows[y].cells[x].className = className
    }

    drawPiece(piece=this.piece, className=piece.locked ? CLASSNAME.LOCKED + " "+ piece.className: piece.className) {
        piece.minoesAbsPos.forEach(pos => this.drawMino(...pos, className))
    }

    clearTable() {
        for(var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                this.drawMino(x, y, CLASSNAME.EMPTY_CELL)
            }
        }
    }
}

class HoldQueue extends MinoesTable {
    constructor() {
        super("hold")
    }

    newGame() {
        this.piece = null
    }

    draw() {
        this.clearTable()
        if (this.piece && state != STATE.PAUSED)
            this.drawPiece(this.piece)
    }
}


class Matrix extends MinoesTable {
    constructor() {
        super("matrix")
    }

    newGame() {
        this.lockedMinoes = Array.from(Array(this.rows), row => Array(this.columns))
        this.piece = null
        this.clearedLines = []
        this.trail = {
            minoesPos: [],
            height: 0
        }
    }
    
    cellIsOccupied(x, y) {
        return 0 <= x && x < this.columns && y < this.rows ? Boolean(this.lockedMinoes[y][x]) : true
    }
    
    spaceToMove(minoesAbsPos) {
        return !minoesAbsPos.some(pos => this.cellIsOccupied(...pos))
    }
    
    draw() {
        // grid
        if (state == STATE.PAUSED) {
            this.clearTable()
        } else {
            for (var y = 0; y < this.rows; y++) {
                for (var x = 0; x < this.columns; x++) {
                    if (this.clearedLines.includes(y))
                        var className = CLASSNAME.CLEARED_LINE
                    else
                        var className = this.lockedMinoes[y][x] || CLASSNAME.EMPTY_CELL
                    this.drawMino(x, y, className)
                }
            }
            
            // ghost
            if (showGhost && !this.piece.locked && state != STATE.GAME_OVER) {
                for (var ghost = this.piece.ghost; this.spaceToMove(ghost.minoesAbsPos); ghost.pos.y++) {}
                ghost.pos.y--
                this.drawPiece(ghost)
            }

            this.drawPiece(this.piece)

            // trail
            if (this.trail.height) {
                this.trail.minoesPos.forEach(pos => {
                    for (var y = pos.y; y < pos.y + this.trail.height; y++)
                        if (this.table.rows[y].cells[pos.x].className == CLASSNAME.EMPTY_CELL)
                            this.drawMino(pos.x, y, CLASSNAME.TRAIL)
                })
            }
        }
    }
}


class NextQueue extends MinoesTable {
    constructor() {
        super("next")
    }

    newGame() {
        this.pieces = Array.from({length: NEXT_PIECES}, (v, k) => new Tetromino(NEXT.PIECE_POSITION[k]))
    }

    draw() {
        this.clearTable()
        if (state != STATE.PAUSED) {
            this.pieces.forEach(piece => this.drawPiece(piece))
        }
    }
}


class ThemePreview extends MinoesTable {
    constructor() {
        super("themePreview")
        this.piece = new Tetromino(THEME.PIECE_POSITION, "T")
    }
}


class Stats {
    constructor () {
        this.scoreCell = document.getElementById("score")
        this.highScoreCell = document.getElementById("highScore")
        this.timeCell = document.getElementById("time")
        this.levelCell = document.getElementById("level")
        this.goalCell = document.getElementById("goal")
        this.clearedLinesCell = document.getElementById("clearedLines")
        this.highScore = Number(localStorage.getItem('highScore'))
        this.highScoreCell.innerText = this.highScore.toLocaleString()
    }

    newGame() {
        this.score = 0
        this.goal = 0
        this.goalCell.innerText = this.goal
        this.clearedLines = 0
        this.clearedLinesCell.innerText = this.clearedLines
        this.time = 0
        this.timeCell.innerText = timeFormat(0)
        this.combo = -1
        this.lockDelay = DELAY.LOCK
        this.fallPeriod = DELAY.FALL
    }

    get score() {
        return this._score
    }

    set score(score) {
        this._score = score
        this.scoreCell.innerText = this._score.toLocaleString()
        if (score > this.highScore) {
            this.highScore = score
            this.highScoreCell.innerText = this.highScore.toLocaleString()
        }
    }

    newLevel(level=null) {
        this.level = level || this.level + 1
        location.hash = "#" + this.level
        this.levelCell.innerText = this.level
        printTempTexts(`NIVEAU<br/>${this.level}`)
        this.goal += 5 * this.level
        this.goalCell.innerText = this.goal
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
            this.clearedLinesCell.innerText = this.clearedLines
            patternScore = SCORES[clearedLines][tSpin] * this.level
            this.goal -= clearedLines
            this.goalCell.innerText = this.goal
            patternName = patternName.join("\n")
        }
        if (this.combo >= 1)
            combo_score = (clearedLines == 1 ? 20 : 50) * this.combo * this.level

        if (patternScore || combo_score)
            this.score += patternScore + combo_score

        if (patternScore) {
            var messages = [patternName, patternScore]
            if (combo_score)
                messages.push(`COMBO x${this.combo}`, combo_score)
                printTempTexts(messages.join("<br/>"))
        }
    }
}


// Functions
function newGame(startLevel=startLevelInput) {
    document.getElementById("startButton").blur()

    holdQueue.newGame()
    matrix.newGame()
    nextQueue.newGame()
    stats.newGame()
    
    localStorage.setItem("startLevel", startLevel)

    document.getElementById("game").style.display = "grid"
    document.getElementById("settings").style.display = "none"
    document.getElementById("settingsButton").style.display = "flex"
    document.getElementById("start").style.display = "none"
    document.getElementById("leaderboardLink").style.display = "none"

    state = STATE.PLAYING
    pressedKeys = new Set()
    actionsToRepeat = []
    addEventListener("keydown", keyDownHandler, false)
    addEventListener("keyup", keyUpHandler, false)
    scheduler.setInterval(clock, 1000)
    newLevel(startLevel)
}

function newLevel(level) {
    stats.newLevel(level)
    generationPhase()
}

function generationPhase(held_piece=null) {
    if (!held_piece) {
        matrix.piece = nextQueue.pieces.shift()
        nextQueue.pieces.push(new Tetromino())
        nextQueue.pieces.forEach((piece, i) => piece.pos = NEXT.PIECE_POSITION[i])
    }
    nextQueue.draw()
    matrix.piece.pos = MATRIX.PIECE_POSITION
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
    if (matrix.piece.minoesAbsPos.every(pos => pos.y < MATRIX.INVISIBLE_ROWS)) {
        matrix.piece.locked = false
        matrix.draw()
        gameOver()
    } else {
        matrix.piece.minoesAbsPos.forEach(pos => matrix.lockedMinoes[pos.y][pos.x] = matrix.piece.className)

        // T-Spin detection
        var tSpin = T_SPIN.NONE
        if (matrix.piece.rotatedLast && matrix.piece.shape == "T") {
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
            if (row.filter(lockedMino => lockedMino.length).length == matrix.columns) {
                matrix.lockedMinoes.splice(y, 1)
                matrix.lockedMinoes.unshift(Array(matrix.columns))
                matrix.clearedLines.push(y)
            }
        })

        stats.lockDown(tSpin, matrix.clearedLines.length)
        matrix.draw()
        scheduler.setTimeout(clearLinesCleared, DELAY.ANIMATION)

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
    removeEventListener("keydown", keyDownHandler, false)
    removeEventListener("keyup", keyUpHandler, false)

    var info = `GAME OVER\nScore : ${stats.score.toLocaleString()}`
    if (stats.score == stats.highScore) {
        localStorage.setItem('highScore', stats.highScore)
        info += "\nBravo ! Vous avez battu votre précédent record."
    }
    
    var retry = 0
    var fd  = new FormData()
    fd.append("score", stats.score)
    var request = new XMLHttpRequest()
    request.onload = function(event) {
        if (event.target.responseText == "true") {
            var player = prompt(info + "\nBravo ! Vous êtes dans le Top 20.\nEntrez votre nom pour publier votre score :" , localStorage.getItem("player") || "")
            if (player && player.length) {
                localStorage.setItem("player", player)
                fd.append("player", player)
                request = new XMLHttpRequest()
                request.onload = function(event) {
                    open("leaderboard.php")
                }
                request.onerror = function(event) {
                    if (confirm('Erreur de connexion.\nRéessayer ?')) {
                        request.open('POST', 'publish.php')
                        request.send(fd)
                    }
                }
                request.open('POST', 'publish.php')
                request.send(fd)
            }
        } else {
            alert(info)
        }
    }
    request.onerror = function(event) {
        retry++
        if (retry < RETRIES) {
            request.open('POST', 'inleaderboard.php')
            request.send(fd)
        } else
            alert(info)
    }
    request.open('POST', 'inleaderboard.php')
    request.send(fd)

    document.getElementById("game").style.display = "grid"
    document.getElementById("settings").style.display = "none"
    document.getElementById("start").style.display = "grid"
    document.getElementById("settingsButton").style.display = "flex"
    document.getElementById("leaderboardLink").style.display = "flex"
}

function autorepeat() {
    if (actionsToRepeat.length) {
        actionsToRepeat[0]()
        if (scheduler.timeoutTasks.has(autorepeat)) {
            scheduler.clearTimeout(autorepeat)
            scheduler.setInterval(autorepeat, autorepeatPeriod)
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
                    scheduler.setTimeout(autorepeat, autorepeatDelay)
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

// actions
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
    for (matrix.trail.height = 0; move(MOVEMENT.DOWN, matrix.piece.minoesPos, true); matrix.trail.height++) {}
    stats.score += 2 * matrix.trail.height
    matrix.draw()
    lockDown()
    scheduler.setTimeout(clearTrail, DELAY.ANIMATION)
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
        holdQueue.piece = new Tetromino(HOLD.PIECE_POSITION, shape)
        holdQueue.piece.holdEnabled = false
        holdQueue.draw()
        generationPhase(matrix.piece)
        matrix.piece.holdEnabled = false
    }
}

function pause() {
    state = STATE.PAUSED
    stats.startTime = performance.now() - stats.startTime
    actionsToRepeat = []
    scheduler.clearInterval(lockPhase)
    scheduler.clearTimeout(lockDown)
    scheduler.clearTimeout(autorepeat)
    scheduler.clearInterval(clock)
    scheduler.clearInterval(delTempTexts)
    holdQueue.draw()
    matrix.draw()
    nextQueue.draw()
    messageDiv.innerHTML = `PAUSE<br/><br/>Appuyez sur<br/>${getKeyName('pause')}<br/>pour reprendre`
}

function resume() {
    if (document.getElementById("game").style.display == "grid") {
        state = STATE.PLAYING
        stats.startTime = performance.now() - stats.startTime
        messageDiv.innerHTML = ""
        scheduler.setInterval(lockPhase, stats.fallPeriod)
        if (matrix.piece.locked)
            scheduler.setTimeout(lockDown, stats.lockDelay)
        scheduler.setInterval(clock, 1000)
        holdQueue.draw()
        matrix.draw()
        nextQueue.draw()
        if (tempTexts.length)
            scheduler.setInterval(delTempTexts, DELAY.MESSAGE)
    }
}

function printTempTexts(text) {
    tempTexts.push(text)
    messageDiv.innerHTML = tempTexts[0]
    if (!scheduler.intervalTasks.has(delTempTexts))
        scheduler.setInterval(delTempTexts, DELAY.MESSAGE)
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

function clock(timestamp) {
        stats.timeCell.innerText = timeFormat(1000 * ++stats.time)
}

function getKeyName(action) {
    return localStorage.getItem(action) || actionsDefaultKeys[action]
}

// Settings functions
function applySettings() {
    actions[STATE.PLAYING] = {}
    actions[STATE.PLAYING][getKeyName("moveLeft")] = moveLeft
    actions[STATE.PLAYING][getKeyName("moveRight")] = moveRight
    actions[STATE.PLAYING][getKeyName("softDrop")] = softDrop
    actions[STATE.PLAYING][getKeyName("hardDrop")] = hardDrop
    actions[STATE.PLAYING][getKeyName("rotateCW")] = rotateCW
    actions[STATE.PLAYING][getKeyName("rotateCCW")] = rotateCCW
    actions[STATE.PLAYING][getKeyName("hold")] = hold
    actions[STATE.PLAYING][getKeyName("pause")] = pause
    actions[STATE.PAUSED] = {}
    actions[STATE.PAUSED][getKeyName("pause")] = resume
    actions[STATE.GAME_OVER] = {}

    autorepeatDelay = localStorage.getItem("autorepeatDelay") || DELAY.autorepeat
    autorepeatPeriod = localStorage.getItem("autorepeatPeriod") || DELAY.AUTOREPEAT_PERIOD

    themeName = localStorage.getItem("themeName") || DEFAULT_THEME
    loadTheme()

    showGhost = localStorage.getItem("showGhost")
    if (showGhost)
        showGhost = (showGhost == "true")
    else
    showGhost = true
}

function replaceSpace(key) {
    return (key == " ") ? "Space" : key
}

function showSettings() {
    if (state == STATE.PLAYING)
        pause()

    document.getElementById("set-moveLeft-key" ).innerHTML = replaceSpace(getKeyName("moveLeft"))
    document.getElementById("set-moveRight-key").innerHTML = replaceSpace(getKeyName("moveRight"))
    document.getElementById("set-softDrop-key" ).innerHTML = replaceSpace(getKeyName("softDrop"))
    document.getElementById("set-hardDrop-key" ).innerHTML = replaceSpace(getKeyName("hardDrop"))
    document.getElementById("set-rotateCW-key" ).innerHTML = replaceSpace(getKeyName("rotateCW"))
    document.getElementById("set-rotateCCW-key").innerHTML = replaceSpace(getKeyName("rotateCCW"))
    document.getElementById("set-hold-key"     ).innerHTML = replaceSpace(getKeyName("hold"))
    document.getElementById("set-pause-key"    ).innerHTML = replaceSpace(getKeyName("pause"))

    document.getElementById("autorepeatDelayRange").value = autorepeatDelay
    document.getElementById("autorepeatDelayRangeLabel").innerText = `Délai initial : ${autorepeatDelay}ms`
    document.getElementById("autorepeatPeriodRange").value = autorepeatPeriod
    document.getElementById("autorepeatPeriodRangeLabel").innerText = `Période : ${autorepeatPeriod}ms`

    document.getElementById("themeSelect").value=themeName;
    themePreview.drawPiece(themePreview.piece)

    document.getElementById("showGhostCheckbox").checked = showGhost

    document.getElementById("settings").style.display = "block"
    document.getElementById("game").style.display = "none"
    document.getElementById("settingsButton").style.display = "none"

    switch(state) {
        case STATE.WAITING:
            document.getElementById("start").style.display = "block"
            document.getElementById("hideSettingsButton").style.display = "none"
            document.getElementById("leaderboardLink").style.display = "flex"
        break
        case STATE.GAME_OVER:
            document.getElementById("start").style.display = "block"
            document.getElementById("hideSettingsButton").style.display = "flex"
            document.getElementById("leaderboardLink").style.display = "flex"
        break
        case STATE.PAUSED:
            document.getElementById("start").style.display = "none"
            document.getElementById("hideSettingsButton").style.display = "flex"
            
    }
}

function hideSettings() {
    applySettings()
    switch(state) {
        case STATE.WAITING:
            document.getElementById("game").style.display = "none"
            document.getElementById("settings").style.display = "none"
            document.getElementById("start").style.display = "block"
            document.getElementById("settingsButton").style.display = "flex"
            document.getElementById("leaderboardLink").style.display = "flex"
        break
        case STATE.GAME_OVER:
            document.getElementById("game").style.display = "grid"
            document.getElementById("settings").style.display = "none"
            document.getElementById("start").style.display = "block"
            document.getElementById("settingsButton").style.display = "flex"
            document.getElementById("leaderboardLink").style.display = "flex"
        break
        case STATE.PAUSED:
            document.getElementById("game").style.display = "grid"
            document.getElementById("settings").style.display = "none"
            document.getElementById("start").style.display = "none"
            document.getElementById("settingsButton").style.display = "flex"
            document.getElementById("leaderboardLink").style.display = "none"
        break
    }
}

function waitKey(button, action) {
    button.innerHTML = "Touche ?"
    selectedButton = button
    selectedAction = action
    button.blur()
    addEventListener("keyup", changeKey, false)
}

function changeKey(e) {
    if (selectedButton) {
        localStorage.setItem(selectedAction, e.key)
        selectedButton.innerHTML = (e.key == " ") ? "Space" : e.key
        selectedButton = null
    }
    removeEventListener("keyup", changeKey, false)
}

function autorepeatDelayChanged() {
    autorepeatDelay = document.getElementById("autorepeatDelayRange").value
    localStorage.setItem("autorepeatDelay", autorepeatDelay)
    document.getElementById("autorepeatDelayRangeLabel").innerText = `Délai initial : ${autorepeatDelay}ms`
}

function autorepeatPeriodChanged() {
    autorepeatPeriod = document.getElementById("autorepeatPeriodRange").value
    localStorage.setItem("autorepeatPeriod", autorepeatPeriod)
    document.getElementById("autorepeatPeriodRangeLabel").innerText = `Période : ${autorepeatPeriod}ms`
}

function themeChanged() {
    themeName = document.getElementById("themeSelect").value
    localStorage.setItem("themeName", themeName)
    loadTheme()
}

function loadTheme() {
    theme = document.getElementById("theme")
    if (theme) document.head.removeChild(theme)
    var link  = document.createElement('link')
    link.id   = "theme";
    link.rel  = 'stylesheet'
    link.type = 'text/css'
    link.href = 'themes/' + themeName+ '.css'
    link.media = 'all'
    document.head.appendChild(link);
}

function showGhostChanged() {
    showGhost = (document.getElementById("showGhostCheckbox").checked == true)
    localStorage.setItem("showGhost", showGhost)
}

// global variables
timeFormat = new Intl.DateTimeFormat("fr-FR", {
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC"
}).format
state = STATE.WAITING
tempTexts = []
actions = {}
selectedButton = null
selectedAction = ""

window.onload = function() {
    applySettings()

    document.getElementById("startLevelInput").value = localStorage.getItem("startLevel") || 1

    document.getElementById("startButton").disabled = false
    document.getElementById("startButton").focus()
    document.getElementById("settingsButton").disabled = false
    messageDiv = document.getElementById("message")

    scheduler = new Scheduler()
    holdQueue = new HoldQueue()
    stats = new Stats()
    matrix = new Matrix()
    nextQueue = new NextQueue()
    themePreview = new ThemePreview()
    
    if (location.hash) newGame(Math.min(location.hash.slice(1), 15))
    else showSettings()
}
