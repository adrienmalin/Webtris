<?php
    $actions = [
        "moveLeft"  => ["label"=>"Gauche",                "defaultKey"=>"ArrowLeft"],
        "moveRight" => ["label"=>"Droite",                "defaultKey"=>"ArrowRight"],
        "softDrop"  => ["label"=>"Chute lente",           "defaultKey"=>"ArrowDown"],
        "hardDrop"  => ["label"=>"Chute rapide",          "defaultKey"=>"Space"],
        "rotateCW"  => ["label"=>"Rotation horaire",      "defaultKey"=>"ArrowUp"],
        "rotateCCW" => ["label"=>"Rotation anti-horaire", "defaultKey"=>"z"],
        "hold"      => ["label"=>"Garde",                 "defaultKey"=>"c"],
        "pause"     => ["label"=>"Pause/Reprise",         "defaultKey"=>"Escape"]
    ];

    function echoTable($id, $invisibleRows, $visibleRows, $columns) {
        echo "                <table id='$id' class=minoes-table>\n";
        for ($y = 0; $y < $invisibleRows; $y++) {
            echo "                    <tr>";
            for ($x = 0; $x < $columns; $x++) {
                echo "<th class=empty-cell></td>";
            }
            echo "</tr>\n";
        }
        for ($y = 0; $y < $visibleRows; $y++) {
            echo "                    <tr>";
            for ($x = 0; $x < $columns; $x++) {
                echo "<td class=empty-cell></td>";
            }
            echo "</tr>\n";
        }
        echo "                </table>\n";
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Webtris</title>
        <link rel="icon" type="image/png" href="favicon.png">
        <link id="theme" rel="stylesheet" type="text/css" href="themes/default/style.css" />
        <script type="text/javascript" src="webtris.js"></script>
    </head>
    <body>
        <section id="gameSection" style="display: none">
            <div>
<?php
    echoTable("holdTable",   6,  0,  6);
    echoTable("matrixTable", 4, 20, 10);
    echoTable("nextTable",  24,  0,  6);
?>
                <table id="statsTable">
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
                <span id="messageSpan"></span>
            </div>
        </section>
        <section id="startSection">
            <fieldset>
                <legend>Nouvelle partie</legend>
                <div>
                    <div></div>
                    <button id="startButton" type="button" onclick="newGame(Number(startLevelInput.value))" disabled>JOUER</button>
                    <label for="startLevel">Niveau</label>
                    <input type="number" id="startLevelInput" min="1" max="15" step="1">
                </div>
            </fieldset>
        </section>
        <section id="settingsSection">
            <fieldset>
                <legend>Clavier</legend>
                <div>
<?php
    foreach($actions as $action=>$parameters) {
?>
                    <label for='<?=$action?>SetKeyButton'><?=$parameters["label"]?></label>
                    <button id='<?=$action?>SetKeyButton' type='button' onclick="waitKey(this, '<?=$action?>')"><?=$parameters["defaultKey"]?></button>
<?php
    }
?>
                </div>
            </fieldset>
            <fieldset>
                <legend>Répétition automatique</legend>
                <div>
                    <label id="autorepeatDelayRangeLabel" for="autorepeatDelayRange">Délai initial : 300ms</label>
                    <input id="autorepeatDelayRange" type="range" oninput="autorepeatDelayChanged()" min="100" max="500" step="10" />
                    <label id="autorepeatPeriodRangeLabel" for="autorepeatPeriodRange">Période : 10ms</label>
                    <input id="autorepeatPeriodRange" type="range" id="autorepeatPeriodRange" oninput="autorepeatPeriodChanged()" min="2" max="50" step="2" />
                </div>
            </fieldset>
            <fieldset>
                <legend>Thème</legend>
                <div>
                    <div></div>
                    <select id="themeSelect" onchange="themeChanged()">
<?php
    foreach(array_slice(scandir("themes"), 2) as $theme) {
       if (is_dir(pathinfo($theme)['dirname']))
            echo "                            <option>" . $theme . "</option>\n";
    }
?>
                    </select>
<?php
    echoTable("themePreviewTable",   2,  0,  3);
?>
                    <div>
                        <input id="showGhostCheckbox" type="checkbox" checked onchange="showGhostChanged()"/>
                        <label for="showGhostCheckbox">Afficher le fantôme</label>
                    </div>
                </div>
            </fieldset>
        </section>
        <section id="leaderboardLinkSection">
            <div>
                <a href="leaderboard.php" target="_blank">TABLEAU DE SCORE</a>
            </div>
        </footer>
    </body>
</html>
