<?php

declare(strict_types=1);

namespace Geolocation\Php;

class View
{
    public array $location;
    protected string $all_loc_html;
    protected object $model;
    public string $post_url = '';

    public function __construct()
    {
        $this->location = $this->getLoc();
        $this->all_loc_html = $this->getAllLocHtml();
    }

    protected function getLoc(): array
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST'
        && $_SERVER['HTTP_SEC_FETCH_SITE'] == 'same-origin'
        && ((!empty($_POST['district']) && filter_input(INPUT_POST, 'district') !== false)
        || (!empty($_POST['city_id']) && filter_input(INPUT_POST, 'city_id') !== false))
        && !empty($_POST['region'])
        && filter_input(INPUT_POST, 'region') !== false
        && !empty($_POST['city'])
        && filter_input(INPUT_POST, 'city') !== false) {
            $elem = 'district';
            if (!empty($_POST['city_id'])) {
                $elem = 'city_id';
            }

            return [
                'city' => filter_input(INPUT_POST, 'city', FILTER_SANITIZE_SPECIAL_CHARS),
                'region' => filter_input(INPUT_POST, 'region', FILTER_SANITIZE_SPECIAL_CHARS),
                $elem => filter_input(INPUT_POST, $elem, FILTER_SANITIZE_SPECIAL_CHARS),
            ];
        } else {
            $geo = new Geo();

            return $geo->getLocation();
        }
    }

    protected function getAllLocHtml(): string
    {
        if (($_SERVER['REQUEST_METHOD'] == 'POST'
        && !empty($_POST['all_loc'])
        && filter_input(INPUT_POST, 'all_loc') !== false)
        || (empty($this->location['city']))
        ) {
            $this->model = new Model();
            $all_loc = $this->model->getAll();

            return $this->alllocHtml($all_loc);
        }

        return '';
    }

    public function htmlOut(): string
    {
        return $this->setCity($this->location)
         .$this->setMessage($this->location)
         .$this->setChoice();
    }

    protected function setCity(array $location): string
    {
        if (!empty($location['city'])) {
            $city = $location['city'];
        } else {
            $city = 'Местоположение';
        }

        return '<label for="modal_1" class="">
				<span class="mr1">&#128205;</span>
				<span id="location">'
                    .$city.
                '</span>
                &ensp;&#8250;
			</label>';
    }

    protected function setMessage(array $location): string
    {
        $checked = '';
        if (empty($location['city'])) {
            $checked = 'checked';
            $message = 'Ваше местоположение неизвестно. </br>Выберите его, нажав на кнопку "Выбрать"';
            $button = '<label for="show_city_select" class="button button_shoose" id="shoose_location">Выбрать</label>';
        } else {
            if ($location['city'] != $location['region']) {
                $locality = '<span id="p_city">'.$location['city'].'</span>'
                            .'</br>'
                            .'<span id="p_region">'.$location['region'].'</span>';
            } else {
                $locality = '<span id="p_city">'.$location['city'].'</span>';
            }
            $message = '<p>Ваше местоположение:</p><p>'.$locality.'</p><p>Если нет - выберите его, нажав на кнопку "Выбрать"</p>';
            $button = ' <noscript>
                            <form action="/" method="post" id="to_city_choice"></form>
                            <input type="submit" form="to_city_choice" name="all_loc" value="Выбрать" class="button" />
                        </noscript>';
        }

        return '<div class="modal"  id="location_message_modal">
				<input id="modal_1" type="checkbox" '.$checked.' />
				<label for="modal_1" class="overlay "></label>
				<article class="">
                    <header class="bgcolor">
						<p>&nbsp;</p>
						<label for="modal_1" class="close">&times;</label>
					</header>
					<section class="content bgcontent" id="clients_location_message">'
                        .$message.
                    '</section >
					<footer class="bgcontent"  id="footer_city_message">'
                        .$button.
                        '<label for="modal_1" class="button dangerous">
							Закрыть
						</label>
					</footer>
				</article >
			</div >';
    }

    protected function setChoice(): string
    {
        $checked = '';
        if ($_SERVER['REQUEST_METHOD'] == 'POST'
                && !empty($_POST['all_loc'])
                && filter_input(INPUT_POST, 'all_loc') !== false) {
            $checked = 'checked';
        }

        return '<div class="modal" id="city_choice_modal">
				<input id="show_city_select" type="checkbox" '.$checked.' />
				<label for="show_city_select" class="overlay "></label>
				<article class="">
					<header class="bgcolor">
						<p>Выбор города</p>
						<label for="show_city_select" class="close">&times;</label>
					</header>
					<section class="content bgcontent" id="section_city_choice">
                        <noscript>
                            <form method="post" action="'.$this->post_url.'" id="form_city_choice">'
                                .$this->all_loc_html.
                            '</form>
                        </noscript>
                    </section>
					<footer class="bgcontent" id="footer_city_choice">
                        <noscript>
                            <button class="submit" form="form_city_choice">
                                Выбрать
                            </button>
                            <label for="show_city_select" class="button dangerous">
                                Закрыть
                            </label>
                        </noscript>
					</footer>
				</article>
			</div>';
    }

    protected function alllocHtml(array $all_loc): string
    {
        $html = '<style type="text/css">
                .checked1 .toggle1,
                .checked2 .toggle2 {
                    display:none;
                }

                .checked1 input[type=radio]:checked ~ .toggle1,
                .checked1 input[type=checkbox]:checked ~ .toggle1,
                .checked2 input[type=radio]:checked ~ .toggle2,
                .checked2 input[type=checkbox]:checked ~ .toggle2
                {
                    display:block;
                }
                
                </style>';

        foreach ($all_loc['district'] as $district) {
            $html .= '<div class="checked1 mt2">';
            $html .= '  <input type="radio" name="district" id="'.$district['id'].'" value="'.$district['name'].'">
                        <label class="checkable" for="'.$district['id'].'">'.$district['name'].'</label>';

            $html .= '<div class="regions toggle1">';
            foreach ($district['regions'] as $k => $region) {
                $html .= '<div class="checked2 ml3 mt2">';
                $html .= '  <input type="radio" name="region" id="'.$district['id'].'_'.$region['id'].'" value="'.$region['name'].'" >
                            <label class=" checkable" for="'.$district['id'].'_'.$region['id'].'">'.$region['name'].'</label>';

                $html .= '<div class="cities toggle2  ml3 mt2">';
                foreach ($district['regions'][$k]['cities'] as $city) {
                    $html .= '  <label class="button" >
                                        <input type="radio" name="city" value="'.$city['name'].'">
                                        <span class="checkable">'.$city['name'].'</span>
                                    </label>';
                }
                $html .= '</div>';
                $html .= '</div>';
            }
            $html .= '</div>';
            $html .= '</div>';
        }

        return '<div class="">'.$html.'</div>';
    }
}
