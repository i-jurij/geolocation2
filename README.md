# Модуль геолокации
# A part of oswc framework for geolocation
## Описание
## Description
Приложение пытается определить местоположение пользователя.     
При первом запросе от клиента приложение (php часть) определяет местонахождение браузера по его ip  
и выдает на страницу.  

Если местоположение не определено, пользователь может указать его вручную.   

При отключенном JS данные формы       
`[ 'city' => 'city name', 'region' => 'region name', 'district': 'district name' }`  
отправляются по адресу текущей страницы (по умолчанию) или заданному в   
`(new Geolocation\Php\View())->post_url = 'your_url';`.   

PHP часть приложения полученные данные не хранит ни на сервере, ни на клиенте   
(куки или сессионные переменные не использует).  

JS проверяет наличие сохраненных данных о местоположении в LocalStorage   
(`{ city: 'city name', adress: 'region name', id: 'id of city from db table' }`), и, если они там есть,   
выводит на страницу их и передает эти данные на сервер для возможной обработки по адресу, указанному на странице (или шаблоне) (`url_save_to_backend`).  

Если данных о местоположении в LocalStorage нет, JS часть пытается получить координаты браузера   
и по этим координатам определить местоположение сначала через запрос на сервер к базе данных по адресу,   
указанному на странице (`url_from_coord` с переменной `coord` d GET запросе (php - $_GET['coord'])),   
потом через яндекс геокодер (отключен по умочанию).  

Если вы хотите использовать яндекс геокодер (в большинстве случаев такой необходимости не возникает), необходимо   
в файле `node_modules/geolocation2/src/js/geo/browserNavigator.js`   
раскомментировать строку 2: `//import { yapikey } from "../config/yapikey.js"`   
и в строках 45, 47 заменить `outSave({ city: '', adress: '' })` на `locationFromYandexGeocoder(yapikey, coord);`,
и создать файл `config/yapikey.js`:  
```
export const yapikey = 'your_yandex_map_api_key_in_quote';
```


Если местоположение так и не определено - предлагает пользователю выбрать его из списка городов,    
полученных с сервера по адресу, указанному на странице (`url_from_db`, также передается http заголовок   
'HTTP_X_FROMDB' = 'shoosefromdb').  

После выбора города JS сохраняет данные в LocalStorage и передает их на сервер для возможной обработки   
по адресу, указанному на странице (или шаблоне) (`url_save_to_backend`, для каждой страницы может быть   
указан свой url, для передачи данных в разные контроллеры или модели, например для получения списка    
товаров по определенному городу на одной странице и списка магазинов в этом городе на другой странице).   
Также передается http заголовок 'X_TOBACKEND' = 'toBackend'.   

Кроме выбранного пользователем города, JS часть сохраняет в LocalStorage копию базы с данными о городах РФ (55Кб), сортированную по округам и регионам, чтобы избежать запросов на сервер при возможном выборе другого местоположения пользователем.


The application tries to get the name of the city and region, passes it in the response.
Javascript checks LocalStorage and, if there is saved data about the city, displays it on the page. In this case, the data received from the server is ignored.
If there is no data about the city in LocalStorage, and the server has provided it, Javascript uses it to display it on the screen and save it in LocalStorage.
If both LocalStorage and the server have not provided data, Javascript tries to get it from the coordinates, first in the database, then using the yandex-geocoder API.
If the data is not received, the user is asked to select their location independently.
The received data is stored in LocalStorage and receive to server backend. 

If javascript disabled php receive city from user choice on the same page (change this into `src/php/View.php`: 142, `<form action=""`).  
And javascript receive  city from user choice to url_save_to_backend (user must set this into template).   

## Install
### Upload
It contain two parts:   
php and js,   
it can be install by composer (composer.json) or npm (package.json) or both.   

Create:   
**composer.json**:   
```
{
    ...
    "repositories": [
        {
            "url": "https://github.com/i-jurij/geolocation2.git",
            "type": "vcs"
        }
    ],
    "require": {
        "i-jurij/geolocation2": "dev-main"
    }
}
```

or   

**package.json**:   
```
{
    ...
    "dependencies": {
        "geolocation2": "github:i-jurij/geolocation2"
  }
}
```

Then run `composer install` or `npm install` from command line into your project directory.   
But you must resolve import from "node_modules" directory in first way (composer) and   
resolve automatic autoloading of php class from "vendor" directory in second way.  

For automatic resolving autoloading of php class from "vendor" directory and   
javascript import from "node_modules" directory you can `composer install` and `npm install` both execute.   
Package weight ~50Kb only.  

#### Example
If your site not use MVC model example is into `index.php` into root directory.   

If MVC:   
Controllers (or presenters) method could be like this:
```
function index(){
    $geoClass = new Geolocation\Php\View();
    // here get data by $geoClass->location
    $data = Model::get($geoClass->location);
    $geoClass->post_url = '/'; // url for form action after city choice, only if javascript is disabled
    $geo = $geoClass->htmlOut(); // string, html code (city name and modal window with info and city choice)
    $this->view->generate(View::index, [$geo, $data]);
}
``` 
Methods before execute with $geoClass->post_url only if JS disabled.   
Don't set this method as target for js fetch request because JS rewrite only inner html of element with id "data_by_location" but no full page.

For shoosing city from list i use fetch request to class Front.  
Js variable "url_from_db" use for getting url to controller that will return json responce.   
For this don't forget to specify the routes in your framework (eg Route('url_from_coord', 'Controller:asyncFromCoord')) for getting city from coordinates and for shoosing from city list.   
Also controllers methods for async requests processing could be like this:  

``` 
function asyncFromCoord(): void {
    $fromCoord = new \Geolocation\Php\Front();
    $fromCoord->fromCoord();
}
``` 

```
function asyncFromDb(): void {
    $fromDb = new \Geolocation\Php\Front();
    $fromDb->getAll();
}
```

```
function getDataByLocation(): void {
        if ($_SERVER['REQUEST_METHOD'] == 'POST'
        && !empty($_POST['district'])
        && filter_input(INPUT_POST, 'district') !== false
        && !empty($_POST['region'])
        && filter_input(INPUT_POST, 'region') !== false
        && !empty($_POST['city'])
        && filter_input(INPUT_POST, 'city') !== false) {
            $location = [
                'city' => filter_input(INPUT_POST, 'city', FILTER_SANITIZE_SPECIAL_CHARS),
                'region' => filter_input(INPUT_POST, 'region', FILTER_SANITIZE_SPECIAL_CHARS),
                'district' => filter_input(INPUT_POST, 'district', FILTER_SANITIZE_SPECIAL_CHARS),
            ];
            
            $data = Model::get($location);
            $html = View::($data);
            header('Content-Type: application/json');
            echo json_encode($html);
            exit;
        }
}
```

Then in base template (layout):
to head put link to [oswc2_styles](https://github.com/i-jurij/oswc2_styles)  
"oswc2_styles" is a dependencies for geolocation,   
also if you install geolocation by npm then "oswc2_styles" is into "node_modules/oswc2_styles" directory. 
If you install geolocation only by composer then you need to get "oswc2_styles" by npm or cdn.

Use Rollup, Gulp, Grunt, Webpack or other for putting oswc2_styles to your assets directory and then
```
<link rel="stylesheet" type="text/css" href="assets/css/oswc2_styles.min.css">
```

or copy oswc2_styles.min.css to your www directory from "node_modules/oswc2_styles/oswc2_styles.min.css" 

or simply
```
<link rel="stylesheet" type="text/css" href="https://cdn.statically.io/gh/i-jurij/oswc2_styles/refs/heads/main/oswc2_styles.min.css">
```

and put to template or View:   
```
	<div id="location_div"><?php echo $geo; ?></div>
    <div id="data_by_location"><?php echo $data; ?></div>

	<script>
        let url_from_coord = 'url_from_coord'; // or {Url::('Controller:asyncGeo')} eg
        let url_from_db = 'url_from_db'; // {Url::('Controller:fromDb')} eg
        let url_save_to_backend = 'url_for_save_city_after_user_selects'; // {Url::('Controller:saveLoc')} eg
    </script>
	<script src="assets/js/geolocation.min.js"></script>
    <!-- or <script src="https://cdn.statically.io/gh/i-jurij/geolocation2/refs/heads/main/build/geolocation2.min.js"></script> -->
```

## Work demo
Simple example is into `index.php` into root directory.   
Example with some MVC is into directory `example`.
Run the PHP dev server into root directory for simple example or into `example` for MVC:   
```
php -S 127.0.01:8000
```   
then open in browser `127.0.01:8000`   

If all right app out city name to element with id "location_div" and put location to localstorage   
`localStorage.setItem('locality', JSON.stringify(data_object));`  
where   
`data_object = { city: 'city name', adress: 'region name', id: 'city id' };`  
and where id - id of city from db table or empty string if city was received from yandex geocoder.     
