<?php

echo '<!DOCTYPE html>
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

		<div id="location_div">'.$geo.'</div>
        <div id="data_by_location">'.$data.'</div>

		<script>
			let url_from_coord = "'.$url_from_coord_js.'";
			let url_from_db = "'.$url_from_db_js.'";
			let url_save_to_backend = "'.$url_save_to_backend_js.'";
		</script>
		<script src="https://cdn.statically.io/gh/i-jurij/geolocation2/refs/heads/main/build/geolocation2.min.js"></script>
		</body>
		</html>';
