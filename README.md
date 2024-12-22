# Модуль геолокации
# A part of oswc framework for geolocation
## Описание
## Description
Приложение пытается определить местоположение пользователя.     
При первом запросе от клиента приложение (php часть) определяет местонахождение браузера по его ip  
и выдает на страницу.   
Если местоположение не определено, пользователь может указать его вручную.   
При отключенном JS форма отправляет данные снова на сервер по адресу текущей страницы (action формы пуст, изменить можно в `vendor/geolocaion2/src/php/View.php`: 142, `<form action=""`), где их можно сохранить для последующего использования.   
PHP часть приложения полученные данные не хранит ни на сервере, ни на клиенте (куки или сессионные переменные не использует).  
JS проверяет наличие сохраненных данных о местоположении в LocalStorage (`{ city: 'city name', adress: 'region name', id: 'id of city from db table' }`), и, если они там есть,   
выводит на страницу их и передает эти данные на сервер для возможной обработки по адресу, указанному на странице (или шаблоне).  
Если данных о местоположении в LocalStorage нет, JS часть пытается получить координаты браузера   
и по этим координатам определить местоположение сначала через запрос на сервер к базе данных по адресу, указанному на странице, потом через яндекс геокодер.  
Если местоположение так и не определено - предлагает пользователю выбрать его.  
После выбора города JS сохраняет данные в LocalStorage и передает их на сервер для возможной обработки по адресу, указанному на странице (или шаблоне).  
Кроме выбранного пользователем города, JS часть сохраняет в LocalStorage копию базы с данными о городах РФ (55Кб), сортированную по округам и регионам, чтобы избежать запросов на сервер при возможном выборе другого местоположения пользователем.

Если вы хотите использовать яндекс геокодер (в большинстве случаев такой необходимости не возникает), необходимо раскомментировать строку   
`//import { yapikey } from "../config/yapikey.js"` в файле `node_modules/geolocation2/src/js/geo/browserNavigator.js`,   
и создать файл `config/yapikey.js`:  
```
export const yapikey = 'your_yandex_map_api_key_in_quote';
```

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
It contain two parts: php and js, also it need upload into vendor and node_modules directory   
for ease of autoloading.   
PHP part that can be install by composer (composer.json) and   
JS part that can be install by npm (package.json).   

Create:   
**composer.json**:   
```
{
    ...
    "repositories": [
        {
            "url": "https://github.com/i-jurij/geolocation2.git",
            "type": "git"
        }
    ],
    "require": {
        "i-jurij/geolocation2": "~2.0"
    }
}
```
**package.json**:   
```
{
    ...
    "dependencies": {
        "geolocation2": "github:i-jurij/geolocation2"
  }
}
```

Then run `composer install` and `npm install` from command line into your project directory.   

#### Example
If your site not use MVC model example is into `index.php` into root directory.   

If MVC:   
Controllers (or presenters) method could be like this:
```
function index(){
    $geo = (new Geolocation\Php\View())->htmlOut();
    $this->view->generate(View::index, $geo);
}
``` 
For shoosing city from list i use fetch request to class Front.  
Js variable "url_from_db" use for getting url to controller that will return json responce.   
For this don't forget to specify the routes in your framework (eg Route('url_from_coord', 'Controller:asyncFromCoord')) for getting city from coordinates and for shoosing from city list.   
Also controllers methods for async request processing could be like this:  
``` 
function asyncFromCoord(): void {
    $fromCoord = new Geolocation\Php\Front();
    $fromCoord->fromCoord();
}
``` 
```
function asyncFromDb(): void {
    $fromDb = new Geolocation\Php\Front();
    $fromDb->getAll();
}
```

Then in base template (layout):
to head put link to [oswc2_styles](https://github.com/i-jurij/oswc2_styles)  
oswc2_styles is a dependencies for geolocation, also you can use Rollup, Gulp, Grunt, Webpack or other for putting oswc2_styles to your assets directory and then
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

	<script>
        let url_from_coord = 'url_from_coord'; // or {Url::('Controller:asyncGeo')} eg
        let url_from_db = 'url_from_db'; // {Url::('Controller:fromDb')} eg
        let url_save_to_backend = 'url_for_save_city_after_user_selects'; // {Url::('Controller:saveLoc')} eg
</script>
	<script src="build/geolocation.min.js"></script>
```

## Work
Example is into `index.php` into root directory.   
Example can be run from root directory of module:   
```
cd rootDirectory;
php -S 127.0.01:8000
```   
then open in browser `127.0.01:8000`   

If all right app out city name to element with id "location_div" and put location to localstorage   
`localStorage.setItem('locality', JSON.stringify(data_object));`  
when   
`data_object = { city: 'city name', adress: 'region name', id: 'id of city from db table' };`    
It can be use for data getting from back throw ajax eg.  
