<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Webtris</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <script type="text/javascript" src="js/webtris.js"></script>
</head>
<body>
    <h1>WEBTRIS</h1>
    <div id="container">
<?php
    function echoTable($id, $rows, $columns) {
        echo "        <table id='$id'>\n";
        for ($y = 0; $y < $rows; $y++) {
            echo "            <tr>";
            for ($x = 0; $x < $columns; $x++) {
                echo "<td></td>";
            }
            echo "</tr>\n";
        }
        echo "        </table>\n";
    }
    echoTable("hold", 6, 6);
    echoTable("matrix", 24, 10);
    echoTable("next", 24, 6);
?>
        <table id="stats">
            <tr><th class="name">SCORE</th><td class="value" id="score">0</td></tr>
            <tr><th class="name">RECORD</th><td class="value" id="highScore">0</td></tr>
            <tr><th class="name">TEMPS</th><td class="value" id="time">00:00</td></tr>
            <tr><th class="name">NIVEAU</th><td class="value" id="level">0</td></tr>
            <tr><th class="name">OBJECTIF</th><td class="value" id="goal">0</td></tr>
            <tr><th class="name">LIGNES</th><td class="value" id="clearedLines">0</td></tr>
        </table>
        <div id="message"></div>
    </div>
    <div id="button-link">
        <a href="options.php" target="_blank">OPTIONS</a>
    </div>
    <div id="button-link">
        <a href="index.php">REJOUER</a>
    </div>
</body>
</html>