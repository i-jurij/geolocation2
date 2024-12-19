# A part of oswc framework for geolocation
## Description
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
            "url": "https://github.com/i-jurij/geolocation.git",
            "type": "git"
        }
    ],
    "require": {
        "i-jurij/geolocation": "~1.0"
    }
}
```
**package.json**:   
```
{
    ...
    "dependencies": {
        "geolocation": "github:i-jurij/geolocation"
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
```
<link rel="stylesheet" type="text/css" href="www/oswc2_styles/oswc2_styles.min.css">
```
and put to template or View:   
```
	<div id="location_div"><?php echo $geo; ?></div>

	<script>
        let url_from_coord = 'url_from_coord'; // or {Url::('Controller:asyncGeo')} eg
        let url_from_db = 'url_from_db';
        let yapikey = 'your_yandex_map_api_key'; // can be not configured
        let url_save_to_backend = 'url_for_save_city_after_user_selects';
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
