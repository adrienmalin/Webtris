<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Webtris</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <script type="text/javascript" src="js/index.js"></script>
</head>
<body>
    <h1>WEBTRIS</h1>
    <div id="actions">
<?php
    function addButton($action, $label) {
        echo "        <div>$label</div>\n";
        echo "        <button type='button' onclick='changeKey(this, \"$action\")'>\n";
        echo "            <script>getKey(\"$action\")</script>\n";
        echo "        </button>\n";
    }
    
    addButton("moveLeft", "GAUCHE");
    addButton("moveRight", "DROITE");
    addButton("softDrop", "CHUTE LENTE");
    addButton("hardDrop", "CHUTE RAPIDE");
    addButton("rotateCW", "ROTATION HORAIRE");
    addButton("rotateCCW", "ROTATE INVERSE");
    addButton("hold", "GARDE");
    addButton("pause", "PAUSE");
?>
    </div>
    <div id="play">
        <a href="webtris.html">JOUER</a>
    </div>
</body>
</html>