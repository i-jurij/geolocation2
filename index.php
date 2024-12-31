<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once __DIR__.'/vendor/autoload.php';
/*
First if is for controller which processed fetch request from js part if user want to get city choice from db.
Second elseif is for controller which processed fetch request from js part if user allowed geolocation.
Third elseif is for controller which processed post request from php part after user selects a city from db.
Fourth else is for controller which processed first page loading.

Php receive city from user choice on the same page (change this into `src/php/View.php`: 142, `<form action=""`).
Js receive  city from user choice to url_save_to_backend (user must set this into template)
*/

// js fetch for city choice from list from db
if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin'
    && isset($_SERVER['HTTP_X_FROMDB'])
    && strtolower($_SERVER['HTTP_X_FROMDB']) == 'shoosefromdb'
) {
    $fromDb = new Geolocation\Php\Fetchcontroller();
    $fromDb->getAll();
    exit;
} // js fetch for getting location from db by coord
elseif (isset($_GET['coord']) && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin') {
    $fromCoord = new Geolocation\Php\Fetchcontroller();
    $fromCoord->fromCoord();
    exit;
} // js fetch for getting data by location after users city choice
elseif ($_SERVER['REQUEST_METHOD'] == 'POST'
        && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin'
        && isset($_SERVER['HTTP_X_TOBACKEND'])
        && strtolower($_SERVER['HTTP_X_TOBACKEND']) == 'tobackend'
       // && (!empty($_POST['city_id']) && filter_input(INPUT_POST, 'city_id') !== false)
        && !empty($_POST['region'])
        && filter_input(INPUT_POST, 'region') !== false
        && !empty($_POST['city'])
        && filter_input(INPUT_POST, 'city') !== false) {
    // here get new data by location eg $data = Model::get(filter_input(INPUT_POST, 'city'));
    $data = '<p class="center">Content after city choice</p>'
            .'<p class="center">'.filter_input(INPUT_POST, 'city', FILTER_SANITIZE_SPECIAL_CHARS).'</p>';
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
} // if js disabled for getting data by location after users city choice
else {
    $geoClass = new Geolocation\Php\View();

    if ($_SERVER['REQUEST_METHOD'] == 'POST'
        && (!empty($_POST['district']) && filter_input(INPUT_POST, 'district') !== false)
        && !empty($_POST['region'])
        && filter_input(INPUT_POST, 'region') !== false
        && !empty($_POST['city'])
        && filter_input(INPUT_POST, 'city') !== false) {
        // here get new data by location eg $data = Model::get(filter_input(INPUT_POST, 'city'));
        $data = '<p class="center">Content after city choice</p>'
                .'<p class="center">'.filter_input(INPUT_POST, 'city', FILTER_SANITIZE_SPECIAL_CHARS).'</p>';
    } // http site request
    else {
        // here get data by $geoClass->location eg $data = Model::get($geoClass->location);
        $data = '<p class="center">Content before city choice</p>'
                .'<p class="center">'.$geoClass->location['city'] ?? '</p>';
    }

    $geoClass->post_url = '/';
    $geo = $geoClass->htmlOut();
}
?>

		<!DOCTYPE html>
		<html lang="ru">

		<head>
			<meta charset="utf-8" />
			<title>Geo Location 2</title>
			<meta name="description" content="Geolocation back and front">
			<META NAME="keywords" CONTENT="geolocation">
			<meta HTTP-EQUIV="Content-type" CONTENT="text/html; charset=UTF-8">
			<meta HTTP-EQUIV="Content-language" CONTENT="ru-RU">
			<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0">
			<meta name="author" content="ijuij" >
			<!-- <link rel="icon" href="favicon.png" /> -->
			<link rel="stylesheet" type="text/css" href="https://cdn.statically.io/gh/i-jurij/oswc2_styles/refs/heads/main/oswc2_styles.min.css">
		</head>

		<body>

		<div id="location_div"><?php echo $geo; ?></div>

		<div id="data_by_location"><?php echo $data; ?></div>

		<script>
			let url_from_coord = '/';
			let url_from_db = '/';
			let url_save_to_backend = '/';
		</script>
		<script src="build/geolocation2.js"></script>
		</body>
		</html>
