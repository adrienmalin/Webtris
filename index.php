<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Webtris</title>
        <link rel="icon" type="image/png" href="favicon.png">
        <link rel="stylesheet" type="text/css" href="style.css" />
        <script type="text/javascript" src="webtris.js"></script>
    </head>
    <body>
        <header>
            <h1>WEBTRIS</h1>
        </header>
        <section id="game">
    <?php
        function echoTable($id, $invisibleRows, $visibleRows, $columns) {
            echo "            <table id='$id' class=minoes-table>\n";
            for ($y = 0; $y < $invisibleRows; $y++) {
                echo "                <tr class=invisible-grid>";
                for ($x = 0; $x < $columns; $x++) {
                    echo "<th class=empty-cell></td>";
                }
                echo "</tr>\n";
            }
            for ($y = 0; $y < $visibleRows; $y++) {
                echo "                <tr class=visible-grid>";
                for ($x = 0; $x < $columns; $x++) {
                    echo "<td class=empty-cell></td>";
                }
                echo "</tr>\n";
            }
            echo "            </table>\n";
        }
        echoTable("hold",   6,  0,  6);
        echoTable("matrix", 4, 20, 10);
        echoTable("next",  24,  0,  6);
    ?>
            <table id="stats">
                <tr><th class="name" colspan=2>SCORE</th></tr>
                <tr><td class="value" id="score" colspan=2>0</td></tr>
                <tr><th class="name" colspan=2>RECORD</th></tr>
                <tr><td class="value" id="highScore" colspan=2>0</td></tr>
                <tr><th class="name" colspan=2>TEMPS</th></tr>
                <tr><td class="value" id="time" colspan=2>00:00</td></tr>
                <tr><td colspan=2><br/></td class="name"></tr>
                <tr><th class="name">NIVEAU</th><td class="value" id="level">0</td></tr>
                <tr><th class="name">OBJECTIF</th><td class="value" id="goal">0</td></tr>
                <tr><th class="name">LIGNES</th><td class="value" id="clearedLines">0</td></tr>
            </table>
            <div id="message"></div>
        </section>
        <section id="settings">
            <fieldset id="keyboard">
                <legend>Clavier</legend>
                <div class="settings">
    <?php
        function addButton($action, $label) {
            echo "                    <label for='set-$action-key'>$label</label>\n";
            echo "                    <button id='set-$action-key' type='button' onclick=\"waitKey(this, '$action')\">...</button>";
        }
        addButton("moveLeft", "Gauche");
        addButton("moveRight", "Droite");
        addButton("softDrop", "Chute lente");
        addButton("hardDrop", "Chute rapide");
        addButton("rotateCW", "Rotation horaire");
        addButton("rotateCCW", "Rotation anti-horaire");
        addButton("hold", "Garde");
        addButton("pause", "Pause/Reprise");
    ?>
                </div>
            </fieldset>
            <fieldset>
                <legend>Répétition automatique</legend>
                <div>
                    <label id="autorepeatDelayRangeLabel" for="autorepeatDelayRange">Délai initial</label>
                    <input id="autorepeatDelayRange" type="range" oninput="autorepeatDelayChanged()" min="100" max="1000" step="10" />
                    <label id="autorepeatPeriodRangeLabel" for="autorepeatPeriodRange">Période</label>
                    <input id="autorepeatPeriodRange" type="range" id="autorepeatPeriodRange" oninput="autorepeatPeriodChanged()" min="2" max="50" step="2" />
                </div>
            </fieldset>
            <fieldset>
                <legend>Thème</legend>
                <div>
                    <div></div>
                    <select id="themeSelect" onchange="themeChanged()">
<?php
    foreach(scandir("themes") as $theme) {
        if (pathinfo ($theme, PATHINFO_EXTENSION) == "css")
            echo "                        <option>" . pathinfo($theme, PATHINFO_FILENAME) . "</option>\n";
    }
?>
                    </select>
<?php
    echoTable("themePreview",   2,  0,  3);
?>
                    <div id="showGhostDiv">
                        <input id="showGhostCheckbox" type="checkbox" checked onchange="showGhostChanged()"/>
                        <label for="showGhostCheckbox">Afficher le fantôme</label>
                    </div>
                </div>
            </fieldset>
            <button id="hideSettingsButton" type="button" onclick="hideSettings()">RETOUR</button>
        </section>
        <section id="start">
            <fieldset>
                <legend>Nouvelle partie</legend>
                <div>
                    <label for="startLevel">Niveau</label>
                    <input type="number" id="startLevelInput" min="1" max="15" step="1">
                    <div></div>
                    <button id="startButton" type="button" onclick="newGame(startLevelInput.value)" disabled>JOUER</button>
                </div>
            </fieldset>
        </section>
        <section>
            <button id="settingsButton" type="button" onclick="showSettings()" disabled>OPTIONS</button>
        </section>
        <footer id="leaderboardLink">
            <a href="leaderboard.php" target="_blank">TABLEAU DE SCORE</a>
        </footer>
    </body>
</html>
