<?php

declare(strict_types=1);

namespace Geolocation\Php;

final class Fetchcontroller
{
    protected Model $geo;

    public function __construct()
    {
        $this->geo = new Model();
    }

    public function getAll()
    {
        $this->sendJson($this->geo->getAll());
    }

    // $coord = long_lat from request (eg 44.000000_33.000000)
    public function fromCoord()
    {
        $this->sendJson($this->geo->fromCoord());
    }

    public function sendJson($data)
    {
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
