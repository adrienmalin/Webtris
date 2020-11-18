// Constants
const NEXT_PIECES = 6
const MATRIX_INVISIBLE_ROWS = 4
const START_POSITION = {
    HOLD: [2, 3],
    MATRIX: [4, 3],
    NEXT: Array.from({length: NEXT_PIECES}, (v, k) => [2, k*4+3])
}

const CLASSNAME = {
    EMPTY_CELL: "",
    MINO: "mino",
    LOCKED: "locked",
    TRAIL: "mino trail",
    GHOST: "ghost",
    CLEARED_LINE: "cleared-line",
    MESSAGE_SPAN_FADE_OUT: "messageSpan-fade-out"
}
const DELAY = {
    LOCK: 500,
    FALL: 1000,
    ANIMATION: 200,
    MESSAGE: 700
}
const MOVEMENT = {
    LEFT:  [-1, 0],
    RIGHT: [ 1, 0],
    DOWN:  [ 0, 1]
}
const SPIN = {
    CW:   1,  // ClockWise
    CCW: -1   // Counterstats.ClockWise
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
const STATE = {
    WAITING: "WAITING",
    PLAYING: "PLAYING",
    PAUSED: "PAUSE",
    GAME_OVER: "GAME OVER",
}
const RETRIES = 3


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
        this.className = CLASSNAME.MINO + " " + this.shape
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
        super("holdTable")
    }

    newGame() {
        this.piece = null
    }

    draw() {
        this.clearTable()
        if (this.piece)
            this.drawPiece(this.piece)
    }
}


class Matrix extends MinoesTable {
    constructor() {
        super("matrixTable")
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
        this.clearTable()
        
        // ghost
        if (showGhostCheckbox.value && !this.piece.locked && state != STATE.GAME_OVER) {
            for (var ghost = this.piece.ghost; this.spaceToMove(ghost.minoesAbsPos); ghost.pos.y++) {}
            ghost.pos.y--
            this.drawPiece(ghost)
        }

        // trail
        if (this.trail.height) {
            this.trail.minoesPos.forEach(pos => {
                for (var y = pos.y; y < pos.y + this.trail.height; y++)
                    this.drawMino(pos.x, y, CLASSNAME.TRAIL)
            })
        }

        this.drawPiece(this.piece)

        // locked minoes
        for (var y = 0; y < this.rows; y++) {
            for (var x = 0; x < this.columns; x++) {
                if (this.clearedLines.includes(y))
                    this.drawMino(x, y, CLASSNAME.CLEARED_LINE)
                else if (this.lockedMinoes[y][x])
                    this.drawMino(x, y, this.lockedMinoes[y][x])
            }
        }
    }
}


class NextQueue extends MinoesTable {
    constructor() {
        super("nextTable")
    }

    newGame() {
        this.pieces = Array.from({length: NEXT_PIECES}, (v, k) => new Tetromino(START_POSITION.NEXT[k]))
    }

    draw() {
        this.clearTable()
        this.pieces.forEach(piece => this.drawPiece(piece))
    }
}


class Stats {
    constructor() {
        this.scoreCell = document.getElementById("score")
        this.highScoreCell = document.getElementById("highScore")
        this.timeCell = document.getElementById("time")
        this.levelCell = document.getElementById("level")
        this.goalCell = document.getElementById("goal")
        this.clearedLinesCell = document.getElementById("clearedLines")
        this.highScore = Number(localStorage.getItem('highScore'))
        this.highScoreCell.innerText = this.highScore.toLocaleString()
        this.timeFormat = new Intl.DateTimeFormat("fr-FR", {
            minute: "2-digit",
            second: "2-digit",
            timeZone: "UTC"
        })
    }

    newGame() {
        this.score = 0
        this.goal = 0
        this.goalCell.innerText = this.goal
        this.clearedLines = 0
        this.clearedLinesCell.innerText = this.clearedLines
        this.time = 0
        this.timeCell.innerText = this.timeFormat.format(0)
        this.combo = -1
        this.lockDelay = DELAY.LOCK
        this.fallPeriod = DELAY.FALL
        this.b2bSequence = false
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
        document.title = `Webtris - Score : ${score}`
    }

    newLevel(level=null) {
        this.level = level || this.level + 1
        location.hash = this.level
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
        var b2bScore = 0
        var comboScore = 0
        
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

        if (this.b2bSequence) {
            if ((clearedLines == 4) || (tSpin && clearedLines)) {
                    b2bScore = patternScore / 2
            } else if ((0 < clearedLines) && (clearedLines < 4) && !tSpin) {
                this.b2bSequence = false
            }
        } else if ((clearedLines == 4) || (tSpin && clearedLines)) {
            this.b2bSequence = true
        }

        if (this.combo >= 1)
            comboScore = (clearedLines == 1 ? 20 : 50) * this.combo * this.level

        if (patternScore) {
            var messages = [patternName, patternScore]
            if (b2bScore)
                messages.push(`BACK TO BACK BONUS`, b2bScore)
            if (comboScore)
                messages.push(`COMBO x${this.combo}`, comboScore)
            printTempTexts(messages.join("<br/>"))
        }

        this.score += patternScore + comboScore + b2bScore
    }
}


class Settings {
    constructor() {
        this.keyBind = {}
        for (let button of settingsSection.getElementsByTagName("button")) {
            let keyName = localStorage.getItem(button.id)
            if (keyName) {
                button.innerHTML = keyName
                this.keyBind[keyName == "Space"? " ": keyName] = playerAction[button.id]
            }
        }

        let autorepeatDelay = localStorage.getItem("autorepeatDelay")
        if (autorepeatDelay) {
            autorepeatDelayRange.value = autorepeatDelay
            autorepeatDelayRange.oninput()
        }
        let autorepeatPeriod = localStorage.getItem("autorepeatPeriod")
        if (autorepeatPeriod) {
            autorepeatPeriodRange.value = autorepeatPeriod
            autorepeatPeriodRange.oninput()
        }

        let themeName = localStorage.getItem("themeName")
        if (themeName) themeSelect.value = themeName
        let showGhost = localStorage.getItem("showGhost")
        if (showGhost) showGhostCheckbox.checked = showGhost == "true"

        let startLevel = localStorage.getItem("startLevel")
        if (startLevel) startLevelInput.value = startLevel
    }

    applyTheme = () => new Promise((resolve, reject) => {
        var link  = document.createElement('link')
        link.id = 'theme'
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = `themes/${themeSelect.value}/style.css`
        link.media = 'all'
        link.onload = resolve
        document.head.appendChild(link)
    })

    save() {
        for (let button of settingsSection.getElementsByTagName("button")) {
            localStorage.setItem(button.id, button.innerHTML)
        }
        localStorage.setItem("autorepeatDelay", autorepeatDelayRange.value)
        localStorage.setItem("autorepeatPeriod", autorepeatPeriodRange.value)
        localStorage.setItem("themeName", themeSelect.value)
        localStorage.setItem("showGhost", showGhostCheckbox.checked)
        localStorage.setItem("startLevel", startLevelInput.value)
    }

    waitKey(button) {
        document.onkeydown  = null
        document.onkeyup = null
        button.previousKey = button.innerHTML
        button.innerHTML = "Touche ?"
        button.onkeyup = function(event) {
            event.preventDefault()
            button.innerHTML = (event.key == " ") ? "Space" : event.key
            settings.keyBind[event.key] = playerAction[button.id]
            button.onkeyup = null
            button.onblur = null
            document.onkeydown  = onkeydown
            document.onkeyup = onkeyup
        }
        button.onblur = function(event) {
            button.innerHTML = button.previousKey
            button.onkeyup = null
            button.onblur = null
            document.onkeydown  = onkeydown
            document.onkeyup = onkeyup
        }
    }
}


// Functions

// Game logic
state = STATE.WAITING

function newGame(startLevel) {
    startButton.blur()

    settings.save()

    holdQueue.newGame()
    matrix.newGame()
    nextQueue.newGame()
    stats.newGame()
    
    startSection.style.display = "none"
    gameSection.style.display = "block"
    settingsSection.style.display = "none"
    footer.style.display = "none"

    state = STATE.PLAYING
    pressedKeys = new Set()
    actionsToRepeat = []
    scheduler.setInterval(stats.clock, 1000)
    document.onkeydown  = onkeydown
    document.onkeyup = onkeyup
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
        nextQueue.pieces.forEach((piece, i) => piece.pos = START_POSITION.NEXT[i])
    }
    nextQueue.draw()
    matrix.piece.pos = START_POSITION.MATRIX
    if (matrix.spaceToMove(matrix.piece.minoesPos.translate(matrix.piece.pos))){
        scheduler.clearInterval(lockPhase)
        scheduler.setInterval(lockPhase, stats.fallPeriod)
        fallingPhase()
    } else
        gameOver()
}

function lockPhase() {
    move(MOVEMENT.DOWN)
}

function fallingPhase() {
    scheduler.clearTimeout(lockDown)
    matrix.piece.locked = false
    matrix.draw()
}

function lockDown(){
    scheduler.clearInterval(lockPhase)
    if (matrix.piece.minoesAbsPos.every(pos => pos.y < MATRIX_INVISIBLE_ROWS)) {
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
    document.onkeydown  = null
    document.onkeyup = null
    messageSpan.innerHTML = "GAME<br/>OVER"
    scheduler.clearInterval(lockPhase)
    scheduler.clearTimeout(lockDown)
    scheduler.clearInterval(stats.clock)

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
            } else
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
    
    location.hash = "game-over"

    startSection.style.display = "block"
    footer.style.display = "block"
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
    let rotationPoint = 1
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

function pause() {
    state = STATE.PAUSED
    location.hash = "pause"
    stats.startTime = performance.now() - stats.startTime
    actionsToRepeat = []
    scheduler.clearInterval(lockPhase)
    scheduler.clearTimeout(lockDown)
    scheduler.clearTimeout(autorepeat)
    scheduler.clearInterval(stats.clock)
    scheduler.clearInterval(delTempTexts)
    holdQueue.draw()
    matrix.draw()
    nextQueue.draw()
    header.style.display = "block"
    gameSection.style.display = "none"
    settingsSection.style.display = "block"
}

function resume() {
    settings.save()
    settingsSection.style.display = "none"
    gameSection.style.display = "block"
    location.hash = stats.level
    state = STATE.PLAYING
    stats.startTime = performance.now() - stats.startTime
    messageSpan.innerHTML = ""
    scheduler.setInterval(lockPhase, stats.fallPeriod)
    if (matrix.piece.locked)
        scheduler.setTimeout(lockDown, stats.lockDelay)
    scheduler.setInterval(stats.clock, 1000)
    holdQueue.draw()
    matrix.draw()
    nextQueue.draw()
    if (tempTexts.length)
        scheduler.setInterval(delTempTexts, DELAY.MESSAGE)
}

playerAction = {
    moveLeft: function () {
        move(MOVEMENT.LEFT)
    },

    moveRight: function () {
        move(MOVEMENT.RIGHT)
    },

    softDrop: function () {
        if (move(MOVEMENT.DOWN))
            stats.score++
    },

    hardDrop: function () {
        scheduler.clearInterval(lockPhase)
        scheduler.clearTimeout(lockDown)
        matrix.trail.minoesPos = Array.from(matrix.piece.minoesAbsPos)
        for (matrix.trail.height = 0; move(MOVEMENT.DOWN, matrix.piece.minoesPos, true); matrix.trail.height++) {}
        stats.score += 2 * matrix.trail.height
        matrix.draw()
        lockDown()
        scheduler.setTimeout(() => {matrix.trail.height = 0; matrix.draw()}, DELAY.ANIMATION)
    },

    rotateCW: function () {
        rotate(SPIN.CW)
    },

    rotateCCW: function () {
        rotate(SPIN.CCW)
    },

    hold: function () {
        if (matrix.piece.holdEnabled) {
            scheduler.clearInterval(move)
            scheduler.clearInterval(lockDown)
            var shape = matrix.piece.shape
            matrix.piece = holdQueue.piece
            holdQueue.piece = new Tetromino(START_POSITION.HOLD, shape)
            holdQueue.piece.holdEnabled = false
            holdQueue.draw()
            generationPhase(matrix.piece)
            matrix.piece.holdEnabled = false
        }
    },

    pauseResume: function() {
        if (state == STATE.PLAYING) {
            pause()
        } else {
            resume()
        }
    }
}

function autorepeat() {
    if (actionsToRepeat.length) {
        actionsToRepeat[0]()
        if (scheduler.timeoutTasks.has(autorepeat)) {
            scheduler.clearTimeout(autorepeat)
            scheduler.setInterval(autorepeat, autorepeatPeriodRange.value)
        }
    } else {
        scheduler.clearTimeout(autorepeat)
        scheduler.clearInterval(autorepeat)
    }
}

// Handle player inputs
const REPEATABLE_ACTION = [playerAction.moveLeft, playerAction.moveRight, playerAction.softDrop]
pressedKeys = new Set()
actionsToRepeat = []

function onkeydown(event) {
    if (event.key in settings.keyBind)
        event.preventDefault()
    if (!pressedKeys.has(event.key)) {
        pressedKeys.add(event.key)
        if (event.key in settings.keyBind) {
            action = settings.keyBind[event.key]
            action()
            if (REPEATABLE_ACTION.includes(action)) {
                actionsToRepeat.unshift(action)
                scheduler.clearTimeout(autorepeat)
                scheduler.clearInterval(autorepeat)
                if (action == softDrop)
                    scheduler.setInterval(autorepeat, stats.fallPeriod / 20)
                else
                    scheduler.setTimeout(autorepeat, autorepeatDelayRange.value)
            }
        }
    }
}

function onkeyup(event) {
    pressedKeys.delete(event.key)
    if (event.key in settings.keyBind) {
        action = settings.keyBind[event.key]
        if (actionsToRepeat.includes(action)) {
            actionsToRepeat.splice(actionsToRepeat.indexOf(action), 1)
            if (!actionsToRepeat.length) {
                scheduler.clearTimeout(autorepeat)
                scheduler.clearInterval(autorepeat)
            }
        }
    }
}

// Text display
tempTexts = []
function printTempTexts(text) {
    tempTexts.push(text)
    messageSpan.innerHTML = tempTexts[0]
    if (!scheduler.intervalTasks.has(delTempTexts))
        scheduler.setInterval(delTempTexts, DELAY.MESSAGE)
    messageSpan.classList.add(CLASSNAME.MESSAGE_SPAN_FADE_OUT)
}

function delTempTexts(self) {
    messageSpan.classList.remove(CLASSNAME.MESSAGE_SPAN_FADE_OUT)
    if (tempTexts.length) 
        tempTexts.shift()
    if (tempTexts.length) 
        messageSpan.innerHTML = tempTexts[0]
    else {
        scheduler.clearInterval(delTempTexts)
        messageSpan.innerHTML = ""
    }
}

function clock() {
    timeCell.innerText = stats.timeFormat.format(1000 * ++stats.time)
}


// Initialization
window.onload = async function() {
    scheduler = new Scheduler()
    holdQueue = new HoldQueue()
    stats     = new Stats()
    matrix    = new Matrix()
    nextQueue = new NextQueue()
    settings  = new Settings()
    await settings.applyTheme()
    let startLevel = parseInt(location.hash.slice(1))
    body.style.display = "block"
    if (1 <= startLevel && startLevel <= 15) {
        newGame(startLevel)
    } else {
        location.hash = ""
        startButton.focus()
    }
}

window.onblur = pause