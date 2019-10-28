const actionLabel = [
    {name: "moveLeft", label: "GAUCHE"},
    {name: "moveRight", label: "DROITE"},
    {name: "softDrop", label: "CHUTE LENTE"},
    {name: "hardDrop", label: "CHUTE RAPIDE"},
    {name: "rotateCW", label: "ROTATION HORAIRE"},
    {name: "rotateCCW:", label: "ROTATE INVERSE"},
    {name: "hold", label: "GARDE"},
    {name: "pause", label: "PAUSE"}
]
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
    if (key == ' ')
        return "Space"
    else
        return key
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
    document.getElementById("actions").innerHTML = actionLabel.map(action => `<div>${action.label}</div>
<button type="button" onclick="changeKey(this, '${action.name}')">${getKey(action.name)}</button>
`).join("\n")

    addEventListener("keyup", keyUpHandler, false)
}