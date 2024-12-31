export function outLocation({ city, adress }) {
    const city_elem = document.getElementById("location");
    //const city_elem = document.getElementById("p_city");
    const clients_place_message = document.getElementById("clients_location_message");
    //const button_shoose_place = document.getElementById("shoose_location");
    const checkbox_modal_window = document.getElementById('modal_1');

    if (city_elem && city && typeof city == 'string') {
        //city_elem.innerHTML = city + "&ensp;&#8250;";
        city_elem.innerHTML = city;
        let adr = '';
        if (typeof adress == 'string' && adress && adress.includes(city + ' ')) {
            adr = '<div class="my2">' + adress + '</div>';
        } else if (typeof adress == 'string' && adress && !adress.includes(city + ' ') && adress != city) {
            adr = '<div class="mt2">' + city + '</div><div class="mb2">' + adress + '</div>';
        } else {
            adr = '<div class="my2">' + city + '.</div>'
        }

        clients_place_message.innerHTML = 'Ваше местоположение: ' + adr + ' Если нет - выберите его, нажав на кнопку "Выбрать"';
        // checkbox_modal_window.checked = true;
    }
    if (city_elem && !city) {
        if (clients_place_message) {
            clients_place_message.innerHTML = 'Ваше местоположение неизвестно. </br>Выберите его, нажав на кнопку "Выбрать"';
            checkbox_modal_window.checked = true;
        }
    }
}
