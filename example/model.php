<?php

function model(array $location): string
{
    if (!empty($location['city'])) {
        return '<p class="center">'.$location['city'].'</p>';
    }

    return '<p class="center">Content before city choice</p>';
}
