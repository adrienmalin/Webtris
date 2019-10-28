<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Webtris</title>
    <link rel="stylesheet" type="text/css" href="css/index.css" />
    <script type="text/javascript" src="js/index.js"></script>
</head>
<body>
    <h1>WEBTRIS</h1>
    <div id="actions">
<?php
    $actionLabel = array(
        "moveLeft"   => "GAUCHE",
        "moveRight"  => "DROITE",
        "softDrop"   => "CHUTE LENTE",
        "hardDrop"   => "CHUTE RAPIDE",
        "rotateCW"   => "ROTATION HORAIRE",
        "rotateCCW" => "ROTATE INVERSE",
        "hold"       => "GARDE",
        "pause"      => "PAUSE",
    );
    foreach($actionLabel as $action => $label)
    {
        echo "        <div>$label</div>\n";
        echo "        <button type='button' onclick='changeKey(this, \"$action\")'>\n";
        echo "            <script>getKey(\"$action\")</script>\n";
        echo "        </button>\n";
    }
?>
    </div>
    <div id="play">
        <a href="webtris.html"><b>JOUER</b></a>
    </div>
</body>
</html>