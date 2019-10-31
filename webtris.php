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
    <div id="grid">
<?php
    function echoTable($id, $rows, $columns) {
        echo "        <table id='$id'>\n";
        echo "            <tbody>\n";
        for ($y = 0; $y < $rows; $y++) {
            echo "                <tr>";
            for ($x = 0; $x < $columns; $x++) {
                echo "<td></td>";
            }
            echo "</tr>\n";
        }
        echo "            </tbody>\n";
        echo "        </table>\n";
    }
    echoTable("hold", 6, 6);
    echoTable("matrix", 24, 10);
    echoTable("next", 24, 6);
?>
        <table id="stats">
            <tbody>
                <tr><td class="stat-label">SCORE</td><td class="stat-value" id="score">0</td></tr>
                <tr><td class="stat-label">RECORD</td><td class="stat-value" id="highScore">0</td></tr>
                <tr><td class="stat-label">TEMPS</td><td class="stat-value" id="time">00:00</td></tr>
                <tr><td class="stat-label">NIVEAU</td><td class="stat-value" id="level">0</td></tr>
                <tr><td class="stat-label">OBJECTIF</td><td class="stat-value" id="goal">0</td></tr>
                <tr><td class="stat-label">LIGNES</td><td class="stat-value" id="clearedLines">0</td></tr>
            </tbody>
        </table>
        <div id="message"></div>
    </div>
    <div id="play">
        <a href="webtris.html">REJOUER</a>
    </div>
</body>
</html>