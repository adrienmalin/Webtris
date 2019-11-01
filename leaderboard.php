<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Meilleurs scores - Webtris</title>
        <link rel="icon" type="image/png" href="favicon.png">
        <link rel="stylesheet" type="text/css" href="css/style.css" />
    </head>
    <body>
        <h1>WEBTRIS</h1>
        <table id="leaderboard">
            <caption>MEILLEURS SCORES</caption>
<?php
    include "db_connect.php";
    try {
        $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASSWORD);
    } catch (Exception $e) {
        die('Erreur : ' . $e->getMessage());
    }
    $top10 = $db->query('SELECT player, score FROM `leaderboard` ORDER BY score DESC LIMIT 10;');
    for ($i = 1; $row = $top10->fetch(); $i++) {
        echo '          <tr><th class="name">' . $i . '<td class="player">' . $row['player'] . '</td><td class="value">' . $row['score'] . "</td></tr>\n";
    }
    $top10->closeCursor();
    $db->close();
?>
        </table>
        <div class="flex-container">
            <div id="button-link">
                <a href="options.php" target="_blank">OPTIONS</a>
            </div>
            <div id="button-link">
                <a href="index.php">REJOUER</a>
            </div>
        </div>
    </body>
</html>