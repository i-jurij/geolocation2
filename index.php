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

// for js fetch for shoose city from list from db
if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin'
    && isset($_SERVER['HTTP_X_FROMDB'])
    && strtolower($_SERVER['HTTP_X_FROMDB']) == 'shoosefromdb'
) {
    $fromDb = new Geolocation\Php\Front();
    $fromDb->getAll();
    exit;
} elseif (isset($_GET['coord']) && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin') {
    $fromCoord = new Geolocation\Php\Front();
    $fromCoord->fromCoord();
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST'
            && !empty($_POST['district'])
            && filter_input(INPUT_POST, 'district') !== false
            && !empty($_POST['region'])
            && filter_input(INPUT_POST, 'region') !== false
            && !empty($_POST['city'])
            && filter_input(INPUT_POST, 'city') !== false) {
    $geo = (new Geolocation\Php\View())->htmlOut();
// processing city from user choice by some back controller
} else {
    $geo = (new Geolocation\Php\View())->htmlOut();
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
			<link rel="stylesheet" type="text/css" href="node_modules/oswc2_styles/oswc2_styles.css">
		</head>

		<body>

		<div id="location_div"><?php echo $geo; ?></div>

		<script>
			let url_from_coord = '/';
			let url_from_db = '/';
			let yapikey = ''; // use only if city not found in db and must be undefined or empty if not use
			//let city_from_back = "<?php // echo !empty($location['city']) ? $location['city'] : 'Местоположение';?>";
    		//let region_from_back = "<?php // echo !empty($location['region']) ? $location['region'] : '';?>";
			let url_save_to_backend = '/';
		</script>
		<script src="build/geolocation.js"></script>
		</body>
		</html>
