// for city getting from Yandex Geocoder from browser navigator geolocation
//import { yapikey } from "../config/yapikey.js"
import { locationFromYandexGeocoder } from './locationFromYandexGeocoder.js';

import { outLocation } from './OutLocationOnPage.js'
import { setLocality } from './localStorage.js'
import { saveToBackend } from './choiceToBackend.js';

// get location from browser geolocation and yandex geocoder
// required user permission for geolocation
export async function getLoc() {

    function outSave({ city, adress, id }) {
        outLocation({ city, adress });
        setLocality({ city, adress, id });
        saveToBackend(city, adress, id);
    }

    function checkResponce(obj) {
        if (typeof obj === 'object' && 'city' in obj && obj.city != '' && obj.city != 'undefined' && typeof obj.city == 'string') {
            return true;
        } else {
            return false;
        }
    }

    let positionOption = { timeout: 5000, /* maximumAge: 24 * 60 * 60, /* enableHighAccuracy: true */ };

    async function getCoords(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        let coord = { long: longitude, lat: latitude };

        let response = await fetch(url_from_coord + '?coord=' + coord.long + '_' + coord.lat, {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });

        //const data = response.clone();
        const json = await response.json();
        try {
            checkResponce(json) ? outSave(json) : outSave({ city: '', adress: '' }) // locationFromYandexGeocoder(yapikey, coord)
        } catch (error) {
            outSave({ city: '', adress: '' }) // locationFromYandexGeocoder(yapikey, coord);
            console.warn(`API response is not JSON.`, error);
        }
    }

    function showError(error) {
        outLocation({ city: '', adress: '' });

        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error("ERROR! User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("ERROR! Location information is unavailable.")
                break;
            case error.TIMEOUT:
                console.error("ERROR! The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                console.error("ERROR! An unknown error occurred.")
                break;
        }
    }

    async function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCoords, showError, positionOption);
        } else {
            outLocation({ city: '', adress: '' });
            console.warn("WARNING! Geolocation is not supported by this browser.");
        }
    }

    getLocation();
}