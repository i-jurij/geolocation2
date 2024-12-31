<?php

declare(strict_types=1);

namespace Geolocation\Php\Lib;

class Ip
{
    public static function get(): string
    {
        global $_SERVER;
        $ip = '';
        if (filter_var($_SERVER['REMOTE_ADDR'], FILTER_VALIDATE_IP)) {
            $ip = trim($_SERVER['REMOTE_ADDR']);
        }

        return $ip;
    }

    public static function getIp(): array
    {
        $ip = '';
        $ipAll = []; // networks IP
        $ipSus = []; // suspected IP
        $serverVariables = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_X_COMING_FROM',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'HTTP_COMING_FROM',
            'HTTP_CLIENT_IP',
            'HTTP_FROM',
            'HTTP_VIA',
            'REMOTE_ADDR',
        ];
        foreach ($serverVariables as $serverVariable) {
            $value = '';
            if (isset($_SERVER[$serverVariable])) {
                $value = $_SERVER[$serverVariable];
            } elseif (getenv($serverVariable)) {
                $value = getenv($serverVariable);
            }
            if (!empty($value)) {
                $tmp = explode(',', $value);
                $ipSus[] = $tmp[0];
                $ipAll = array_merge($ipAll, $tmp);
            }
        }
        $ipSus = array_unique($ipSus);
        $ipAll = array_unique($ipAll);
        $ip = (sizeof($ipSus) > 0) ? $ipSus[0] : $ip;

        return [
            'ip' => $ip,
            'suspected' => $ipSus,
            'network' => $ipAll,
        ];
    }
}
