import { outLocation } from './OutLocationOnPage.js'
import { setLocality } from './localStorage.js'

export async function locationFromYandexGeocoder(yapikey, { long, lat }, format = 'json', kind = 'locality', results = 1) {
    const url = "https://geocode-maps.yandex.ru/1.x/?apikey=" + yapikey + "&geocode=" + long + "," + lat + "&format=" + format + "&results=" + results + "&kind=" + kind;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Response status from geocode-maps.yandex.ru: ${response.status}`);
        }

        const json = await response.json();

        let jr = json.response;
        if (jr) {
            let name = jr.GeoObjectCollection.featureMember[0].GeoObject.name;
            let description = jr.GeoObjectCollection.featureMember[0].GeoObject.description;

            if (name && description) {
                outLocation({ city: name, adress: description });
                setLocality({ city: name, adress: description });
                saveToBackend(name, description, '');
            } else {
                outLocation({ city: '', adress: '' });
                console.error('No location data in responce from geocode-maps.yandex.ru');
            }
        }
    } catch (error) {
        outLocation({ city: '', adress: '' });
        console.error(error.message);
    }
}