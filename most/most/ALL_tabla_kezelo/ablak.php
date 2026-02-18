<?php
session_start();
$talalat = $_SESSION['keresett_adat'] ?? null;

if (!$talalat) {
    echo "❌ Nincs betöltött adat.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="hu">
    <link rel="icon" type="image/png" href="/Iroda/Marika-min.png"> <!-- Favicon -->
<head>
  <meta charset="UTF-8">
  <title>ALL tábla kezelő/Ablak</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f2f2f2;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      background: white;
    }
    th, td {
      border: 1px solid #aaa;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #eee;
    }
  </style>
</head>
<body>
  <h2>Talált sor részletei</h2>
  <table>
    <tr>
      <?php foreach ($talalat as $kulcs => $ertek): ?>
        <th><?= htmlspecialchars($kulcs) ?></th>
      <?php endforeach; ?>
    </tr>
    <tr>
      <?php foreach ($talalat as $ertek): ?>
        <td><?= htmlspecialchars($ertek) ?></td>
      <?php endforeach; ?>
    </tr>
  </table>
</body>
</html>
