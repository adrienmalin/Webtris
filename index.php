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
                echo "<th></td>";
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
        <script type="text/javascript" src="app.js"></script>
    </head>
    <body>
        <section id="settingsSection">
            <h1>WEBTRIS</h1>
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
                    <table id="themePreviewTable" class=minoes-table>
                        <tr>
                            <th class="mino I"></th>
                            <th></th>
                            <th class="mino J"></th>
                            <th class="mino J"></th>
                            <th class="mino J"></th>
                            <th></th>
                            <th class="mino S"></th>
                            <th></th>
                        </tr>
                        <tr>
                            <th class="mino I"></th>
                            <th class="mino O"></th>
                            <th class="mino O"></th>
                            <th></th>
                            <th class="mino J"></th>
                            <th class="mino Z"></th>
                            <th class="mino S"></th>
                            <th class="mino S"></th>
                        </tr>
                        <tr>
                            <th class="mino I"></th>
                            <th class="mino O"></th>
                            <th class="mino O"></th>
                            <th class="mino L"></th>
                            <th class="mino Z"></th>
                            <th class="mino Z"></th>
                            <th class="mino T"></th>
                            <th class="mino S"></th>
                        </tr>
                        <tr>
                            <th class="mino I"></th>
                            <th class="mino L"></th>
                            <th class="mino L"></th>
                            <th class="mino L"></th>
                            <th class="mino Z"></th>
                            <th class="mino T"></th>
                            <th class="mino T"></th>
                            <th class="mino T"></th>
                        </tr>
                    </table>
                    <div id="showGhostDiv">
                        <input id="showGhostCheckbox" type="checkbox" checked onchange="showGhostChanged()"/>
                        <label for="showGhostCheckbox">Afficher le fantôme</label>
                    </div>
                </div>
            </fieldset>
        </section>
        <section id="gameSection" style="display: none">
            <div>
<?php
    echoTable("holdTable",   6,  0,  6);
    echoTable("matrixTable", 4, 20, 10);
    echoTable("nextTable",  24,  0,  6);
?>
                <table id="statsTable">
                    <tr><th colspan=2>SCORE</th></tr>
                    <tr><td id="score" colspan=2>0</td></tr>
                    <tr><th colspan=2>RECORD</th></tr>
                    <tr><td id="highScore" colspan=2>0</td></tr>
                    <tr><th colspan=2>TEMPS</th></tr>
                    <tr><td id="time" colspan=2>00:00</td></tr>
                    <tr><td colspan=2><br/></td></tr>
                    <tr><th>NIVEAU</th><td id="level">0</td></tr>
                    <tr><th>OBJECTIF</th><td id="goal">0</td></tr>
                    <tr><th>LIGNES</th><td id="clearedLines">0</td></tr>
                </table>
                <span id="messageSpan"></span>
            </div>
        </section>
        <section id="startSection">
            <fieldset>
                <legend>Nouvelle partie</legend>
                <div>
                    <label for="startLevel">Niveau</label>
                    <input type="number" id="startLevelInput" min="1" max="15" step="1" value="1">
                    <div></div>
                    <button id="startButton" type="button" onclick="newGame(Number(startLevelInput.value))" disabled>JOUER</button>
                </div>
            </fieldset>
        </section>
        <footer id="footer">
            <div>
                <a href="leaderboard.php" target="_blank">TABLEAU DE SCORE</a>
            </div>
            <div id="credits">
                Sources d'inspiration des thèmes :
                <a href="https://github.com/kubowania/Tetris">Ania Kubow</a>
                <a href="https://manjaro.org/">Manjaro</a>
                <a href="https://www.tetriseffect.game/">Tetris Effect</a>
            </div>
        </footer>
    </body>
</html>
