<?php

declare(strict_types=1);

namespace Geolocation\Php;

/**
 * Manages user-related operations such as authentication and adding new users.
 */
final class Model
{
    public $db;

    public function __construct()
    {
        $reflector = new \ReflectionClass('Geolocation\Php\Fetchcontroller');
        $model_file = realpath($reflector->getFileName());
        $src_dir = dirname($model_file, 2);

        $db = 'geolocation.db';

        $path_to_db = $src_dir.DIRECTORY_SEPARATOR.'sqlite'.DIRECTORY_SEPARATOR.$db;

        $dsn = "sqlite:$path_to_db";

        $opt = [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ];

        if ($this->db == null) {
            $this->db = new \PDO($dsn, null, null, $opt);
        }
    }

    public function getAll(): array
    {
        $query = '  SELECT  d.id AS district_id, d.name AS district, 
                            r.id AS region_id, r.name AS region,
                            c.id AS city_id, c.name AS city
                    FROM `geo_district` AS d
                    INNER JOIN `geo_regions` AS r ON d.id = r.district_id
                        INNER JOIN `geo_city` AS c ON r.id = c.region_id
        ';

        $rows = $this->db->query($query);

        foreach ($rows as $row) {
            $res['district'][$row['district_id']]['id'] = $row['district_id'];
            $res['district'][$row['district_id']]['name'] = $row['district'];

            $res['district'][$row['district_id']]['regions'][$row['region_id']]['id'] = $row['region_id'];
            $res['district'][$row['district_id']]['regions'][$row['region_id']]['name'] = $row['region'];

            $res['district'][$row['district_id']]['regions'][$row['region_id']]['cities'][$row['city_id']]['id'] = $row['city_id'];
            $res['district'][$row['district_id']]['regions'][$row['region_id']]['cities'][$row['city_id']]['name'] = $row['city'];
        }

        return $res ?? [];
    }

    public function fromCoord()
    {
        $long_lat = filter_input(INPUT_GET, 'coord', FILTER_SANITIZE_ENCODED);
        $locality = [];
        if (!empty($long_lat) && \is_string($long_lat)) {
            list($long, $lat) = explode('_', trim($long_lat));
            $area = (1 / 111) * 100; // ~100km (1° ~ 111 км, 1 км = 1 / 111 = 0,009009009009009°.)

            $lat_dist_minus = (float) $lat - $area;
            $lat_dist_plus = (float) $lat + $area;
            $long_dist_minus = (float) $long - $area;
            $long_dist_plus = (float) $long + $area;

            $params0 = [$lat_dist_minus, $lat_dist_plus, $long_dist_minus, $long_dist_plus];

            $query = 'SELECT `city`, `adress`, `id`
                                    FROM (
                                            SELECT `id`, `city`, `adress`, `distance`
                                                FROM (
                                                        SELECT `gc`.`id`, `gc`.`name` AS city, `r`.`name` AS adress,
                                                            ACOS(SIN(PI()*gc.latitude/180.0)*SIN(PI()*?/180.0)
                                                                +COS(PI()*gc.latitude/180.0)*COS(PI()*?/180.0)
                                                                *COS(PI()*?/180.0-PI()*gc.longitude/180.0))*6371 AS distance
                                                        FROM `geo_city` AS gc
                                                        INNER JOIN `geo_regions` AS r ON `r`.`id` = `gc`.`region_id`
                                                        WHERE gc.latitude BETWEEN ? AND ?
                                                        AND gc.longitude BETWEEN ? AND ?
                                                ) AS subquery
                                            ORDER BY distance
                                            LIMIT 5
                                    ) AS limited
                                    ORDER BY distance
                                    LIMIT 1;';
            $params = [(float) $lat, (float) $lat, (float) $long, ...$params0];

            $pre = $this->db->prepare($query);
            if ($pre != false) {
                if ($pre->execute($params)) {
                    $locality = $pre->fetch();
                }
            }
        }

        return $locality;
    }

    public function getDistrict($city): array
    {
        $query = '  SELECT  d.name AS district, 
                            r.name AS region,
                            c.name AS city
                    FROM `geo_city` AS c
                    INNER JOIN `geo_regions` AS r ON d.id = r.district_id
                    INNER JOIN `geo_district` AS d ON r.id = c.region_id
                    WHERE `c`.`name` LIKE :ci
                    LIMIT 1
        ';
        $pre = $this->db->prepare($query);
        $c = $city.'%';
        $pre->bindParam(':ci', $c);
        if ($pre != false && $pre->execute()) {
            $geo = $pre->fetch();
        }

        return is_array($geo) ? $geo : [];
    }
}
