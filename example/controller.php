<?php

$geoClass = new Geolocation\Php\View();
// here get data by $geoClass->location eg $data = Model::get($geoClass->location);
$data = model($geoClass->location);
$geoClass->post_url = $url_save_to_backend_php;
$geo = $geoClass->htmlOut();
