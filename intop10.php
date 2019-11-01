<?php
    include "db_connect.php";
    if (isset($_POST['score'])) {
        try {
            $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASSWORD);
        } catch (Exception $e) {
            die('Erreur : ' . $e->getMessage());
        }
        $query = $db->prepare('SELECT player, score FROM `leaderboard` ORDER BY score DESC LIMIT 10;');
        $entryScore = $query->fetch();
        $query->closeCursor();
        $score = (int) $_POST['score'];
        if ($score > $entryScore)
            echo "true";
        else
            echo "false";
    } else {
        header($_SERVER["SERVER_PROTOCOL"] . " 405 Method Not Allowed", true, 405);
    }
?>