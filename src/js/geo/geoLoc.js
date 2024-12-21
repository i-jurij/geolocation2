import { saveToBackend } from './choiceToBackend.js';

import { outLocation } from './OutLocationOnPage.js'

import { getLoc } from './browserNavigator.js'

import { setLocality } from './localStorage.js'
import { getLocalStorage } from './localStorage.js'

export function geoLoc() {

    document.addEventListener('DOMContentLoaded', () => {
        // search in localstorage keeped data with user location
        //let locality = JSON.parse(localStorage.getItem('locality'));
        let locality = getLocalStorage('locality');

        const substring = "Местоположение";

        if (locality) {
            outLocation({ city: locality.city, adress: locality.adress });
            saveToBackend(locality.city, locality.adress, '');
        } else {
            const city_from_back_el = document.getElementById('location');
            if (city_from_back_el) {
                let city_from_back = city_from_back_el.innerHTML;
                if (city_from_back) {
                    if (city_from_back.includes(substring)) {
                        // get city from coord by browser.navigator.
                        getLoc();
                        //outLocation({ city: '', adress: '' });
                    } else {
                        const city_name_el = document.getElementById('p_city');
                        let city_name = '';
                        if (city_name_el) {
                            city_name = city_name_el.innerHTML;
                        } else {
                            console.warn('WARNING! Element with id "p_city" is empty (city name).')
                        }
                        const reg = document.getElementById('p_region');
                        let region = '';
                        if (reg) {
                            region = reg.innerHTML;
                        } else {
                            console.warn('WARNING! Element with id "p_region" is empty (region info).')
                        }

                        outLocation({ city: city_from_back, adress: region });
                        setLocality({ city: city_from_back, adress: region });
                        saveToBackend(city_from_back, region, '');
                    }
                } else {
                    console.warn('WARNING! Element with id "location" is empty (city name data).')
                }
            } else {
                console.warn('WARNING! Element with id "location" not exist (city name data).')
            }

        }
    });
}