<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once realpath('../vendor/autoload.php');

// js fetch for city choice from list from db
if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin'
    && isset($_SERVER['HTTP_X_FROMDB'])
    && strtolower($_SERVER['HTTP_X_FROMDB']) == 'shoosefromdb'
) {
    $fromDb = new Geolocation\Php\Fetchcontroller();
    $fromDb->getAll();
    exit;
}

// js fetch for getting location from db by coord
if (isset($_GET['coord']) && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin') {
    $fromCoord = new Geolocation\Php\Fetchcontroller();
    $fromCoord->fromCoord();
    exit;
}

// js fetch for getting data by location after users city choice
if ($_SERVER['REQUEST_METHOD'] == 'POST'
        && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin'
        && isset($_SERVER['HTTP_X_TOBACKEND'])
        && strtolower($_SERVER['HTTP_X_TOBACKEND']) == 'tobackend'
        // && ((!empty($_POST['district']) && filter_input(INPUT_POST, 'district') !== false)
        // || (!empty($_POST['city_id']) && filter_input(INPUT_POST, 'city_id') !== false))
        && !empty($_POST['region'])
        && filter_input(INPUT_POST, 'region') !== false
        && !empty($_POST['city'])
        && filter_input(INPUT_POST, 'city') !== false) {
    $data = filter_input(INPUT_POST, 'city', FILTER_SANITIZE_SPECIAL_CHARS);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
