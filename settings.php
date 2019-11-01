<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Webtris</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <script type="text/javascript" src="js/options.js"></script>
</head>
<body>
    <h1>WEBTRIS</h1>
    <div id="settings">
<?php
    function addButton($action, $label) {
?>
        <div><?=$label?></div>
        <button type="button" onclick="changeKey(this, '<?=$action?>')">
            <script>getKey("<?=$action?>")</script>
        </button>
<?php    }
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
</body>
</html>