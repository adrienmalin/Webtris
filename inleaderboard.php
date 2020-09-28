<?php
    include "db_connect.php";
    if (isset($_POST['score'])) {
        try {
            $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASSWORD);
        } catch (Exception $e) {
            die('Erreur : ' . $e->getMessage());
        }
        $score = (int) $_POST['score'];
        $entryScore = (int) $db->query('SELECT score FROM `leaderboard` ORDER BY score DESC LIMIT 19, 1;')->fetch()['score'];
        if ($score > $entryScore)
            echo "true";
        else
            echo "false";
        $query = null;
        $db = null;
    } else {
        header($_SERVER["SERVER_PROTOCOL"] . " 405 Method Not Allowed", true, 405);
    }
?>
