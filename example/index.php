<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once realpath('../vendor/autoload.php');

require_once realpath('./model.php');

$url_save_to_backend_php = '';
$url_save_to_backend_js = 'fetchcontroller.php';
$url_from_coord_js = $url_save_to_backend_js;
$url_from_db_js = $url_save_to_backend_js;

include realpath('./controller.php');

include realpath('./view.php');
