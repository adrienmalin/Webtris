<?php
    include "db_connect.php";
    if (isset($_POST['player']) && isset($_POST['score'])) {
        try {
            $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASSWORD);
        } catch (Exception $e) {
            die('Erreur : ' . $e->getMessage());
        }
        $query = $db->prepare('INSERT INTO `leaderboard` (`player`, `score`) VALUES (:player, :score);');
        $query->execute(array("player" => strip_tags($_POST['player']), "score" => (int) $_POST['score']));

        $RowsToDelete = $db->query('SELECT id FROM `leaderboard` ORDER BY score DESC LIMIT 10, 10;');
        while($row = $RowsToDelete->fetch()) {
            $id = $row['id'];
            $db->query("DELETE FROM `leaderboard` WHERE id=" . $row['id'] . ";");
        }
        $row->closeCursor();
        $db->close();
    } else {
        header($_SERVER["SERVER_PROTOCOL"] . " 405 Method Not Allowed", true, 405);
    }
?>