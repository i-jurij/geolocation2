import { saveToBackend } from './choiceToBackend.js';
import { outLocation } from './OutLocationOnPage.js'
import { getLocalStorage, setLocality, setAllLocality } from './localStorage.js'

import * as autoCompleteStyles from "../autoComplete.js-10.2.9/dist/css/autoComplete.geolocation.css"; /* import the styles as a string */
import autoComplete from '../autoComplete.js-10.2.9/src/autoComplete.js'

function districtOut(districts) {
    let inner = '<option value="" id="empty_district">Округ</option>';

    for (const key of Object.keys(districts)) {
        // console.log(district[key]['id'] + ' ' + district[key]['name'])
        inner = inner + '<option value="' + districts[key]['id'] + '">' + districts[key]['name'] + '</option>'
    }
    let shoose_district = document.querySelector('#shoose_district');
    if (shoose_district) {
        shoose_district.innerHTML = inner;
    }
    let shoose_region = document.querySelector('#shoose_region');
    if (shoose_region) {
        shoose_region.innerHTML = '<option value="">Регион</option>';
    }
    let shoose_city = document.querySelector('#shoose_city');
    if (shoose_city) {
        shoose_city.innerHTML = '<option value="">Город</option>';
    }
}

function regionOut(regions) {
    let inner = '<option value="" id="empty_region">Регион</option>';
    for (const key of Object.keys(regions)) {
        inner = inner + '<option value="' + regions[key]['id'] + '">' + regions[key]['name'] + '</option>'
    }
    let shoose_region = document.querySelector('#shoose_region');
    if (shoose_region) {
        shoose_region.disabled = false;
        shoose_region.innerHTML = inner;
    }
    let shoose_city = document.querySelector('#shoose_city');
    if (shoose_city) {
        shoose_city.innerHTML = '<option value="">Город</option>';
    }
}

function cityOut(cities) {
    let inner = '<option value="" id="empty_city">Город</option>';
    for (const key of Object.keys(cities)) {
        inner = inner + '<option value="' + cities[key]['id'] + '">' + cities[key]['name'] + '</option>'
    }
    let shoose_city = document.querySelector('#shoose_city');
    if (shoose_city) {
        shoose_city.disabled = false;
        shoose_city.innerHTML = inner;
    }

}

function hideModal(id) {
    const mod_1 = document.getElementById(id);
    if (mod_1) {
        mod_1.checked = false;
    }
}

function regionOutAndCityOutAndSave(districts) {
    let shoose_district = document.querySelector('#shoose_district');
    if (shoose_district) {
        shoose_district.addEventListener('change', function () {
            let options_empty_district = document.querySelector('#empty_district');
            if (options_empty_district) {
                options_empty_district.remove();
            }

            let district_id = this.value;
            let district_text = this.options[this.selectedIndex].text;

            if (district_id) {
                let regions0 = districts[district_id];
                if (regions0) {
                    let regions = regions0['regions'];
                    regionOut(regions);
                    cityOutAndSave(regions);
                }
            }
        })
    }
}

function cityOutAndSave(regions) {
    let shoose_region = document.querySelector('#shoose_region');
    if (shoose_region) {
        shoose_region.addEventListener('change', function () {
            let options_empty_region = document.querySelector('#empty_region');
            if (options_empty_region) {
                options_empty_region.remove();
            }
            let region_id = this.value;
            let region_text = this.options[this.selectedIndex].text;
            if (region_id) {
                let cities0 = regions[region_id];
                if (cities0) {
                    let cities = cities0['cities'];
                    if (cities) {
                        cityOut(cities);
                    }
                }

                let shoose_city = document.querySelector('#shoose_city');
                if (shoose_city) {
                    shoose_city.addEventListener('change', function () {
                        let options_empty_city = document.querySelector('#empty_city');
                        if (options_empty_city) {
                            options_empty_city.remove();
                        }
                        let city_id = this.value;
                        let city_text = this.options[this.selectedIndex].text;

                        saveCity(city_text, region_text, city_id);
                    });
                }
            }
        })
    }
}

function touchOrClick() {
    const isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
    const isTablet = navigator.userAgent.toLowerCase().match(/tablet/i);
    const isAndroid = navigator.userAgent.toLowerCase().match(/android/i);
    const isiPhone = navigator.userAgent.toLowerCase().match(/iphone/i);
    const isiPad = navigator.userAgent.toLowerCase().match(/ipad/i);
    if (isMobile || isTablet || isAndroid || isiPhone || isiPad) {
        return 'touchstart';
    } else {
        return 'click';
    }
}

function sc_common(city_text, region_text, city_id) {
    //let opt_adress = region_text + ' ' + district_text;
    let opt_adress = region_text;
    setLocality({ city: city_text, adress: opt_adress, id: city_id });
    outLocation({ city: city_text, adress: opt_adress });
    //sending city data to the server by fetch request
    saveToBackend(city_text, region_text, city_id);

    const show_city_select = document.getElementById('show_city_select');
    if (show_city_select) {
        show_city_select.checked = false;
    }
}

function saveCity(city_text, region_text, city_id) {
    let save_city = document.querySelector('#save_city');
    if (save_city) {
        save_city.addEventListener(touchOrClick(), sc_common(city_text, region_text, city_id));
    }
}

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

function dataForLiveSearch(loc) {
    let districts = loc.district;
    let data_for_livesearch = [];
    for (let e of Object.keys(districts)) {
        for (let el of Object.keys(districts[e]['regions'])) {
            for (let ele of Object.keys((districts[e]['regions'][el]['cities']))) {
                let region_name = districts[e]['regions'][el].name;
                let city_name = districts[e]['regions'][el]['cities'][ele].name;
                let city_id = districts[e]['regions'][el]['cities'][ele].id;
                data_for_livesearch.push({
                    id: city_id,
                    city: city_name,
                    region: region_name
                });
            }
        }
    }
    return data_for_livesearch;
}

function aC(loc) {
    let config_live_search = {
        selector: "#autoComplete",
        placeHolder: "Поиск...",
        data: {
            src: dataForLiveSearch(loc),
            keys: ["city"],
            cache: true,
        },
        threshold: 3,
        debounce: 300, // Milliseconds value
        searchEngine: "strict",
        resultsList: {
            element: (list, data) => {
                if (!data.results.length) {
                    // Create "No Results" message element
                    const message = document.createElement("div");
                    // Add class to the created element
                    message.setAttribute("class", "no_result");
                    message.style.padding = "1rem";
                    // Add message text content
                    message.innerHTML = '<span>Не найдено ' + sanitize(data.query) + '</span>';
                    // Append message element to the results list
                    list.prepend(message);
                }
            },
            noResults: true,
        },
        resultItem: {
            highlight: true,
        },
        //submit: true,
    };

    const autoCompleteJS = new autoComplete(config_live_search);
    document.querySelector("#autoComplete").addEventListener("selection", function (event) {
        // "event.detail" carries the autoComplete.js "feedback" object
        //console.log(event.detail.selection.value);
        let vall = event.detail.selection.value;
        document.querySelector('#autoComplete').value = '';
        saveCity(vall.city, vall.region, vall.id);
    });
}

function allOut(loc) {
    let distr = loc.district;
    districtOut(distr);
    regionOutAndCityOutAndSave(distr);
    aC(loc);
}

function fetchToServer() {
    fetch(url_from_db, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'X_FROMDB': 'shooseFromDb',
        }
    })
        .then((response) => response.ok === true ? response.json() : false)
        .then(locations => {
            setAllLocality(locations);
            allOut(locations);
        });
}

export function fromDB() {
    document.addEventListener('DOMContentLoaded', function () {
        const shoose_location = document.querySelector('#shoose_location');
        if (shoose_location) {
            function shloc_common() {
                let all_locality = getLocalStorage('all_locality');
                if (all_locality) {
                    allOut(all_locality);
                } else {
                    fetchToServer();
                }
            }
            shoose_location.addEventListener('click', function () {
                hideModal('modal_1');
                shloc_common();
            }, false);
            shoose_location.addEventListener('touchstart', function () {
                hideModal('modal_1');
                shloc_common();
            }, false);
        }
    });
};