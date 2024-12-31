export function saveToBackend(city_text, region_text, city_id) {
    const formData = new FormData();

    formData.set("city_id", city_id);
    formData.set("city", city_text);
    formData.set("region", region_text);

    fetch(url_save_to_backend, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X_TOBACKEND': 'toBackend',
        },
        body: formData,
    })
        .then(response => response.json())
        .then(json => {
            const data_elem = document.getElementById('data_by_location');
            if (data_elem) {
                data_elem.innerHTML = json;
            }
        });
}