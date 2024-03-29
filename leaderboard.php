<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Meilleurs scores - Webtris</title>
        <link rel="icon" type="image/png" href="favicon.png">
        <script type="text/javascript" src="leaderboard.js"></script>
    </head>
    <body>
        <header>
            <h1>WEBTRIS</h1>
        </header>
        <table id="leaderboard">
            <caption>MEILLEURS SCORES</caption>
<?php
    include "db_connect.php";
    try {
        $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASSWORD);
    } catch (Exception $e) {
        die('Erreur : ' . $e->getMessage());
    }
    $top10 = $db->query('SELECT player, score FROM `leaderboard` ORDER BY score DESC LIMIT 20;');
    for ($i = 1; $row = $top10->fetch(); $i++) {
        $score = number_format($row['score'], 0, ",", " ");
        echo '          <tr><th class="name">' . $i . '<td class="player">' . $row['player'] . '</td><td class="value">' . $score . "</td></tr>\n";
    }
    $top10 = null;
    $db = null;
?>
        </table>
        <footer>
            <button onclick="window.close()">Fermer</button>
        </footer>
    </body>
</html>
