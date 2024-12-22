<?php

declare(strict_types=1);

namespace Geolocation\Php\Lib;

class IsBot
{
    /**
     * function for bots check.
     */
    public static function check(): bool
    {
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        if (empty($user_agent)) {
            return false;
        }
        // проверяем на гугл и на яндекс
        if (stristr($user_agent, 'yandex') !== false
            || stristr($user_agent, 'google') !== false
            || stristr($user_agent, 'bot') !== false
            || stristr($user_agent, 'spider') !== false
            || stristr($user_agent, 'crawler') !== false
            || stristr($user_agent, 'curl') !== false) {
            return true;
        }
        // прочие боты
        $bots = [
            'Accoona', 'ia_archiver', 'Ask Jeeves', 'W3C_Validator', 'WebAlta', 'YahooFeedSeeker',
            'Yahoo!', 'Ezooms', 'SiteStatus', 'Nigma.ru', 'Baiduspider', 'SISTRIX', 'findlinks',
            'proximic', 'OpenindexSpider', 'statdom.ru', 'Spider', 'Snoopy', 'heritrix', 'Yeti',
            'DomainVader', 'StackRambler',
        ];
        // ищем в массиве
        foreach ($bots as $bot) {
            if (stripos($user_agent, $bot) !== false) {
                return true;
            }
        }

        return false;
    }
}
