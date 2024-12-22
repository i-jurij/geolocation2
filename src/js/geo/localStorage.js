export function getLocalStorage(name) {
    let item = localStorage.getItem(name);
    if (item != null){
        return JSON.parse(item);
    }
    return false;
}

export function setLocality({ city, adress = '', id = '' }) {
    let data_object = { city, adress, id };
    localStorage.setItem('locality', JSON.stringify(data_object));
}

export function removeLocality() {
    localStorage.removeItem("locality");
}

export function setAllLocality(data_array) {
    localStorage.setItem('all_locality', JSON.stringify(data_array));
}
