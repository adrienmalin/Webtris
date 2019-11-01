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
var selectedButton = null
var selectedAction = ""

function getKey(action) {
    key = localStorage.getItem(action) || actionsDefaultKeys[action]
    if (key == ' ') key = "Space"
    document.open()
    document.write(key)
    document.close()
}

function changeKey(button, action) {
    button.innerHTML = "Touche ?"
    selectedButton = button
    selectedAction = action
    button.blur()
}

function keyUpHandler(e) {
    if (selectedButton) {
        localStorage.setItem(selectedAction, e.key)
        selectedButton.innerHTML = (e.key == " ") ? "Space" : e.key
        selectedButton = null
    }
}

window.onload = function() {
    addEventListener("keyup", keyUpHandler, false)
}