(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function hideModal$1(id) {
		const mod_1 = document.getElementById(id);
		if (mod_1) {
			mod_1.checked = false;
		}
	}

	function html() {
		function newData(elem_id, new_inner) {
			//let elem = document.querySelector('#' + elem_id);
			let elem = document.getElementById(elem_id);
			if (elem) {
				elem.innerHTML = new_inner;
			}
		}

		let inner_message_footer = '<label for="show_city_select" class="button" id="shoose_location">\
						Выбрать\
					</label>\
					<label for="modal_1" class="button dangerous">\
						Закрыть\
					</label>';

		let inner_choice_section = '<p>По названию:</p>\
				<input class="" name="city_search_input" id="autoComplete" type="search" dir="ltr" spellcheck=false autocorrect="off" autocomplete="off" autocapitalize="off" maxlength="2048" tabindex="1">\
				<p>Или из списка:</p>\
				<select id="shoose_district" class=" select mb1">\
					<option>Округ</option>\
				</select>\
				<select id="shoose_region" class=" select mb1" disabled>\
					<option>Регион (область)</option>\
				</select>\
				<select id="shoose_city" class=" select" disabled>\
					<option>Город</option>\
				</select>';


		let inner_choice_footer = '<button id="save_city" class="button">\
									Выбрать\
								</button>\
								<label for="show_city_select" class="button dangerous">\
									Закрыть\
								</label>';

		document.addEventListener('DOMContentLoaded', function () {
			hideModal$1("modal_1");
			newData('footer_city_message', inner_message_footer);
			newData('section_city_choice', inner_choice_section);
			newData('footer_city_choice', inner_choice_footer);
		});
	}

	function saveToBackend(city_text, region_text, city_id) {
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

	function outLocation({ city, adress }) {
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
	            adr = '<div class="my2">' + city + '.</div>';
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

	function getLocalStorage(name) {
	    let item = localStorage.getItem(name);
	    if (item != null){
	        return JSON.parse(item);
	    }
	    return false;
	}

	function setLocality({ city, adress = '', id = '' }) {
	    let data_object = { city, adress, id };
	    localStorage.setItem('locality', JSON.stringify(data_object));
	}

	function setAllLocality(data_array) {
	    localStorage.setItem('all_locality', JSON.stringify(data_array));
	}

	// for city getting from Yandex Geocoder from browser navigator geolocation
	//import { yapikey } from "../config/yapikey.js"

	// get location from browser geolocation and yandex geocoder
	// required user permission for geolocation
	async function getLoc() {

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
	            checkResponce(json) ? outSave(json) : outSave({ city: '', adress: '' }); // locationFromYandexGeocoder(yapikey, coord)
	        } catch (error) {
	            outSave({ city: '', adress: '' }); // locationFromYandexGeocoder(yapikey, coord);
	            console.warn(`API response is not JSON.`, error);
	        }
	    }

	    function showError(error) {
	        outLocation({ city: '', adress: '' });

	        switch (error.code) {
	            case error.PERMISSION_DENIED:
	                console.error("ERROR! User denied the request for Geolocation.");
	                break;
	            case error.POSITION_UNAVAILABLE:
	                console.error("ERROR! Location information is unavailable.");
	                break;
	            case error.TIMEOUT:
	                console.error("ERROR! The request to get user location timed out.");
	                break;
	            case error.UNKNOWN_ERROR:
	                console.error("ERROR! An unknown error occurred.");
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

	function geoLoc() {

	    document.addEventListener('DOMContentLoaded', () => {
	        // search in localstorage keeped data with user location
	        //let locality = JSON.parse(localStorage.getItem('locality'));
	        let locality = getLocalStorage('locality');
	        const city_from_back_el = document.getElementById('location');
	        let city_from_back = '';
	        if (city_from_back_el) {
	            city_from_back = city_from_back_el.innerHTML;
	        } else {
	            console.warn('WARNING! Element with id "location" not exist (city name data).');
	        }

	        const substring = "Местоположение";

	        if (locality) {
	            outLocation({ city: locality.city, adress: locality.adress });
	            if (city_from_back && !city_from_back.includes(locality.city)) {
	                let city_id = '';
	                if (locality.id) {
	                    city_id = locality.id;
	                }
	                saveToBackend(locality.city, locality.adress, city_id);
	            }
	        } else {
	            if (city_from_back) {
	                if (city_from_back.includes(substring)) {
	                    // get city from coord by browser.navigator.
	                    getLoc();
	                } else {
	                    const city_name_el = document.getElementById('p_city');
	                    if (city_name_el) {
	                        city_name_el.innerHTML;
	                    } else {
	                        console.warn('WARNING! Element with id "p_city" is empty (city name).');
	                    }
	                    const reg = document.getElementById('p_region');
	                    let region = '';
	                    if (reg) {
	                        region = reg.innerHTML;
	                    } else {
	                        console.warn('WARNING! Element with id "p_region" is empty (region info).');
	                    }

	                    outLocation({ city: city_from_back, adress: region });
	                    setLocality({ city: city_from_back, adress: region });
	                    //saveToBackend(city_from_back, region, '');
	                }
	            } else {
	                console.warn('WARNING! Element with id "location" is empty (city name data).');
	            }


	        }
	    });
	}

	document.head.appendChild(document.createElement("style")).textContent=".autoComplete_wrapper{display:inline-block;position:relative;}.autoComplete_wrapper>ul{position:absolute;max-height:15rem;overflow-y:scroll;top:100%;left:0;right:0;padding:0;margin:0.5rem 0 0 0;border-radius:0.25rem;background-color:#181b17;border:1px solid rgba(33,33,33,0.1);z-index:1000;outline:none;}.autoComplete_wrapper>ul>li{padding:0.5rem 1rem;list-style:none;text-align:left;font-size:1rem;color:#c0ccb9;transition:all 0.1s ease-in-out;border-radius:0.25rem;background-color:#181b17;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:all 0.2s ease;}.autoComplete_wrapper>ul>li:hover{cursor:pointer;background-color:rgba(193,193,193,0.1);}.autoComplete_wrapper>ul>li mark{background-color:transparent;color:rgb(77,183,44);font-weight:bold;}.autoComplete_wrapper>ul>li[aria-selected=\"true\"]{background-color:rgba(147,147,147,0.2);}";

	/**
	 * DOM Element selector
	 *
	 * @param {String|HTMLElement} element - html tag | html element
	 *
	 * @returns {HTMLElement} - selected html element
	 */
	const select$1 = (element) => (typeof element === "string" ? document.querySelector(element) : element());

	/**
	 * Create new element or Edit existing element
	 *
	 * @param {String|HTMLElement} tag - html tag | html element
	 * @param {Object} options - of the html element
	 *
	 * @returns {HTMLElement} - created html element
	 */
	const create = (tag, options) => {
	  const el = typeof tag === "string" ? document.createElement(tag) : tag;

	  for (const key in options) {
	    const val = options[key];

	    if (key === "inside") {
	      val.append(el);
	    } else if (key === "dest") {
	      select$1(val[0]).insertAdjacentElement(val[1], el);
	    } else if (key === "around") {
	      const ref = val;
	      ref.parentNode.insertBefore(el, ref);

	      el.append(ref);

	      if (ref.getAttribute("autofocus") != null) ref.focus();
	    } else if (key in el) {
	      el[key] = val;
	    } else {
	      el.setAttribute(key, val);
	    }
	  }

	  return el;
	};

	/**
	 * Get the "input" query value
	 *
	 * @param {Element} field - input or textarea element
	 *
	 * @returns {String} - Raw query value as a string
	 */
	const getQuery = (field) =>
	  field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field.value : field.innerHTML;

	/**
	 * Format input value
	 *
	 * @param {String} value - user's raw search query value
	 * @param {Object} diacritics - formatting on/off
	 *
	 * @returns {String} - Raw "input" value as a string
	 */
	const format = (value, diacritics) => {
	  value = String(value).toLowerCase();

	  return diacritics
	    ? value
	        .normalize("NFD")
	        .replace(/[\u0300-\u036f]/g, "")
	        .normalize("NFC")
	    : value;
	};

	/**
	 * Debouncer
	 *
	 * @param {Function} callback - Callback function
	 * @param {Number} duration - Delay time value
	 *
	 * @returns {Function} - Debouncer function
	 */
	const debounce = (callback, duration) => {
	  let timer;

	  return () => {
	    clearTimeout(timer);

	    timer = setTimeout(() => callback(), duration);
	  };
	};

	/**
	 * Trigger condition validator
	 *
	 * @param {String} query - User's manipulated search query value
	 * @param {Function} condition - trigger condition rule
	 * @param {Number} threshold - of query length to trigger
	 *
	 * @returns {Boolean} - For autoComplete.js to run or not
	 */
	const checkTrigger = (query, condition, threshold) => (condition ? condition(query) : query.length >= threshold);

	/**
	 * Highlight matching characters
	 *
	 * @param {String} value - user's raw search query value
	 * @param {String} cls - of highlighted character
	 *
	 * @returns {HTMLElement} - newly create html element
	 */
	const mark = (value, cls) =>
	  create("mark", {
	    innerHTML: value,
	    ...(typeof cls === "string" && { class: cls }),
	  }).outerHTML;

	/**
	 * Configuring options stage
	 *
	 * @param {Object} ctx - autoComplete.js configuration options
	 */
	var configure = (ctx) => {
	  const { name, options, resultsList, resultItem } = ctx;

	  // Populate Configuration options
	  for (const option in options) {
	    if (typeof options[option] === "object") {
	      if (!ctx[option]) ctx[option] = {};

	      for (const subOption in options[option]) {
	        ctx[option][subOption] = options[option][subOption];
	      }
	    } else {
	      ctx[option] = options[option];
	    }
	  }

	  // Dynamic Config Options
	  ctx.selector = ctx.selector || "#" + name;
	  resultsList.destination = resultsList.destination || ctx.selector;
	  resultsList.id = resultsList.id || name + "_list_" + ctx.id;
	  resultItem.id = resultItem.id || name + "_result";

	  // Assign the "input" html element
	  ctx.input = select$1(ctx.selector);
	};

	/**
	 * Event emitter/dispatcher
	 *
	 * @param {String} name - Name of fired event
	 * @param {Object} ctx - autoComplete.js context
	 */
	var eventEmitter = (name, ctx) => {
	  // Dispatch event on "input"
	  ctx.input.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: ctx.feedback, cancelable: true }));
	};

	/**
	 * Find matching characters in record
	 *
	 * @param {String} query - Search query value
	 * @param {String} record - Data record string
	 * @param {Object} options - Search Engine configuration options
	 *
	 * @returns {String} - Matching data record
	 */
	var search = (query, record, options) => {
	  const { mode, diacritics, highlight } = options || {};

	  const nRecord = format(record, diacritics);
	  record = String(record);
	  query = format(query, diacritics);

	  if (mode === "loose") {
	    // Query string with no spaces
	    query = query.replace(/ /g, "");
	    const qLength = query.length;
	    // Query character cursor position based on match
	    let cursor = 0;
	    // Matching characters
	    const match = Array.from(record)
	      .map((character, index) => {
	        // Matching case
	        if (cursor < qLength && nRecord[index] === query[cursor]) {
	          // Highlight matching character if active
	          character = highlight ? mark(character, highlight) : character;
	          // Move cursor position
	          cursor++;
	        }

	        return character;
	      })
	      .join("");

	    // If record is fully scanned
	    if (cursor === qLength) return match;
	  } else {
	    // Get starting index of matching characters
	    let match = nRecord.indexOf(query);
	    // Strict mode
	    if (~match) {
	      // Extract matching characters from record
	      query = record.substring(match, match + query.length);
	      // Highlight matching characters if active
	      match = highlight ? record.replace(query, mark(query, highlight)) : record;

	      return match;
	    }
	  }
	};

	/**
	 * Get data from source
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const getData = async (ctx, query) => {
	  const { data } = ctx;

	  if (data.cache && data.store) return;

	  ctx.feedback = data.store =
	    typeof data.src === "function"
	      ? data.src.constructor.name === "AsyncFunction"
	        ? await data.src(query)
	        : data.src(query)
	      : data.src;

	  /**
	   * @emit {response} event on data request
	   **/
	  eventEmitter("response", ctx);
	};

	/**
	 * Find matches to "query"
	 *
	 * @param {String} query - User's search query string
	 * @param {Object} ctx - autoComplete.js context
	 */
	const findMatches = (query, ctx) => {
	  const { data, searchEngine } = ctx;

	  let matches = [];

	  // Find matches from data source
	  data.store.forEach((value, index) => {
	    const find = (key) => {
	      const record = key ? value[key] : value;

	      const match =
	        typeof searchEngine === "function"
	          ? searchEngine(query, record)
	          : search(query, record, {
	              mode: searchEngine,
	              diacritics: ctx.diacritics,
	              highlight: ctx.resultItem.highlight,
	            });

	      if (!match) return;

	      let result = { match, value };

	      if (key) result.key = key;

	      matches.push(result);
	    };

	    if (data.keys) {
	      for (const key of data.keys) {
	        find(key);
	      }
	    } else {
	      find();
	    }
	  });

	  // Find results matching to the query
	  if (data.filter) matches = data.filter(matches);

	  const results = matches.slice(0, ctx.resultsList.maxResults);

	  // Prepare data feedback object
	  ctx.feedback = { query, matches, results };

	  /**
	   * @emit {results} event on search response with matches
	   **/
	  eventEmitter("results", ctx);
	};

	// String holders
	const Expand = "aria-expanded";
	const Active = "aria-activedescendant";
	const Selected = "aria-selected";

	/**
	 * Data feedback object constructor
	 *
	 * @param {Object} ctx - autoComplete.js context
	 * @param {Number} index - of the selected result item
	 */
	const feedback = (ctx, index) => {
	  ctx.feedback.selection = {
	    index,
	    ...ctx.feedback.results[index],
	  };
	};

	/**
	 * Render list of matching results
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const render = (ctx) => {
	  const { resultsList, list, resultItem, feedback } = ctx;
	  const { matches, results } = feedback;

	  // Reset cursor
	  ctx.cursor = -1;

	  // Clear list
	  list.innerHTML = "";

	  if (matches.length || resultsList.noResults) {
	    const fragment = new DocumentFragment();

	    // Generate results elements
	    results.forEach((result, index) => {
	      // Create new list item
	      const element = create(resultItem.tag, {
	        id: `${resultItem.id}_${index}`,
	        role: "option",
	        innerHTML: result.match,
	        inside: fragment,
	        ...(resultItem.class && { class: resultItem.class }),
	      });

	      // If custom content is active pass params
	      if (resultItem.element) resultItem.element(element, result);
	    });

	    // Add fragment of result items to DOM list
	    list.append(fragment);

	    // Run custom container function if active
	    if (resultsList.element) resultsList.element(list, feedback);

	    open(ctx);
	  } else {
	    // Check if there are NO results
	    close(ctx);
	  }
	};

	/**
	 * Open closed list
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const open = (ctx) => {
	  if (ctx.isOpen) return;
	  // Set expanded attribute on the parent to true
	  (ctx.wrapper || ctx.input).setAttribute(Expand, true);
	  // Remove hidden attribute from list
	  ctx.list.removeAttribute("hidden");
	  // Set list to opened
	  ctx.isOpen = true;

	  /**
	   * @emit {open} event after results list is opened
	   **/
	  eventEmitter("open", ctx);
	};

	/**
	 * Close opened list
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const close = (ctx) => {
	  if (!ctx.isOpen) return;
	  // Set expanded attribute on the parent to false
	  (ctx.wrapper || ctx.input).setAttribute(Expand, false);
	  // Add input active descendant attribute
	  ctx.input.setAttribute(Active, "");
	  // Add hidden attribute from list
	  ctx.list.setAttribute("hidden", "");
	  // Set list to closed
	  ctx.isOpen = false;

	  /**
	   * @emit {close} event after "resultsList" is closed
	   **/
	  eventEmitter("close", ctx);
	};

	/**
	 * Go to result item by index
	 *
	 * @param {Number} index - of the selected result item
	 * @param {Object} ctx - autoComplete.js context
	 */
	const goTo = (index, ctx) => {
	  const { resultItem } = ctx;

	  // List of result items
	  const results = ctx.list.getElementsByTagName(resultItem.tag);
	  // Selected result item Classes
	  const cls = resultItem.selected ? resultItem.selected.split(" ") : false;

	  if (ctx.isOpen && results.length) {
	    // Previous cursor state
	    const state = ctx.cursor;

	    // Reset cursor to first item if exceeding end of list
	    if (index >= results.length) index = 0;
	    // Move cursor to the last item if exceeding beginning of list
	    if (index < 0) index = results.length - 1;

	    // Current cursor position
	    ctx.cursor = index;

	    if (state > -1) {
	      // Remove "aria-selected" attribute from the item
	      results[state].removeAttribute(Selected);
	      // Remove "selected" class from the item
	      if (cls) results[state].classList.remove(...cls);
	    }

	    // Set "aria-selected" value to true
	    results[index].setAttribute(Selected, true);
	    // Add "selected" class to the selected item
	    if (cls) results[index].classList.add(...cls);

	    // Set "aria-activedescendant" value to the selected item
	    ctx.input.setAttribute(Active, results[ctx.cursor].id);

	    // Scroll to selection
	    ctx.list.scrollTop = results[index].offsetTop - ctx.list.clientHeight + results[index].clientHeight + 5;

	    // Prepare Selection data feedback object
	    ctx.feedback.cursor = ctx.cursor;
	    feedback(ctx, index);

	    /**
	     * @emit {navigate} event on results list navigation
	     **/
	    eventEmitter("navigate", ctx);
	  }
	};

	/**
	 * Go to next result item
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const next = (ctx) => {
	  goTo(ctx.cursor + 1, ctx);
	};

	/**
	 * Go to previous result item
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const previous = (ctx) => {
	  goTo(ctx.cursor - 1, ctx);
	};

	/**
	 * Select result item with given index or current cursor
	 *
	 * @param {Object} ctx - autoComplete.js context
	 * @param {Object} event - of selection
	 * @param {Number} index - of the selected result item
	 */
	const select = (ctx, event, index) => {
	  // Check if cursor within list range
	  index = index >= 0 ? index : ctx.cursor;

	  // Prevent empty selection
	  if (index < 0) return;

	  // Prepare Selection data feedback object
	  ctx.feedback.event = event;
	  feedback(ctx, index);

	  /**
	   * @emit {selection} event on result item selection
	   **/
	  eventEmitter("selection", ctx);

	  close(ctx);
	};

	/**
	 * Click selection handler
	 *
	 * @param {Object} event - "Click" event object
	 * @param {Object} ctx - autoComplete.js context
	 */
	const click = (event, ctx) => {
	  const itemTag = ctx.resultItem.tag.toUpperCase();
	  const items = Array.from(ctx.list.querySelectorAll(itemTag));
	  const item = event.target.closest(itemTag);

	  // Check if clicked item is a "result" item
	  if (item && item.nodeName === itemTag) {
	    select(ctx, event, items.indexOf(item));
	  }
	};

	/**
	 * List navigation handler
	 *
	 * @param {Object} event - "keydown" press event Object
	 * @param {Object} ctx - autoComplete.js context
	 */
	const navigate = (event, ctx) => {
	  // Check pressed key
	  switch (event.keyCode) {
	    // Down/Up arrow
	    case 40:
	    case 38:
	      event.preventDefault();
	      // Move cursor based on pressed key
	      event.keyCode === 40 ? next(ctx) : previous(ctx);

	      break;
	    // Enter
	    case 13:
	      if (!ctx.submit) event.preventDefault();
	      // If cursor moved
	      if (ctx.cursor >= 0) select(ctx, event);

	      break;
	    // Tab
	    case 9:
	      // Select on Tab if enabled
	      if (ctx.resultsList.tabSelect && ctx.cursor >= 0) select(ctx, event);

	      break;
	    // Esc
	    case 27:
	      // Clear "input" value
	      ctx.input.value = "";

	      /**
	       * @emit {clear} event on input clear
	       **/
	      eventEmitter('clear', ctx);

	      close(ctx);
	      break;
	  }
	};

	/**
	 * Start stage
	 *
	 * @param {Object} ctx - autoComplete.js context
	 * @param {String} q - API search query value
	 */
	async function start (ctx, q) {
	  // Get "input" query value
	  let queryVal = q || getQuery(ctx.input);
	  queryVal = ctx.query ? ctx.query(queryVal) : queryVal;
	  // Get trigger decision
	  const condition = checkTrigger(queryVal, ctx.trigger, ctx.threshold);

	  // Validate trigger condition
	  if (condition) {
	    // Get from source
	    await getData(ctx, queryVal);
	    // Check if data fetch failed
	    if (ctx.feedback instanceof Error) return;
	    // Find matching results to the query
	    findMatches(queryVal, ctx);
	    // Render "resultsList"
	    if (ctx.resultsList) render(ctx);
	  } else {
	    // Close open list
	    close(ctx);
	  }
	}

	/**
	 * Manage all given events
	 *
	 * @param {Object} events - List of events
	 * @param {Function} callback - Callback function
	 */
	const eventsManager = (events, callback) => {
	  for (const element in events) {
	    for (const event in events[element]) {
	      callback(element, event);
	    }
	  }
	};

	/**
	 * Attach all events listeners
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const addEvents = (ctx) => {
	  const { events } = ctx;

	  const run = debounce(() => start(ctx), ctx.debounce);

	  // Public events listeners list
	  const publicEvents = (ctx.events = {
	    input: {
	      ...(events && events.input),
	    },
	    ...(ctx.resultsList && { list: events ? { ...events.list } : {} }),
	  });

	  // Private events listeners list
	  const privateEvents = {
	    input: {
	      input() {
	        run();
	      },
	      keydown(event) {
	        navigate(event, ctx);
	      },
	      blur() {
	        close(ctx);
	      },
	    },
	    list: {
	      mousedown(event) {
	        event.preventDefault();
	      },
	      click(event) {
	        click(event, ctx);
	      },
	    },
	  };

	  // Populate all private events into public events list
	  eventsManager(privateEvents, (element, event) => {
	    // Do NOT populate any events except "input" If "resultsList" disabled
	    if (!ctx.resultsList && event !== "input") return;
	    // Do NOT overwrite public events
	    if (publicEvents[element][event]) return;
	    // Populate public events
	    publicEvents[element][event] = privateEvents[element][event];
	  });

	  // Attach all public events
	  eventsManager(publicEvents, (element, event) => {
	    ctx[element].addEventListener(event, publicEvents[element][event]);
	  });
	};

	/**
	 * Remove all attached public events listeners
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	const removeEvents = (ctx) => {
	  eventsManager(ctx.events, (element, event) => {
	    ctx[element].removeEventListener(event, ctx.events[element][event]);
	  });
	};

	/**
	 * Initialization stage
	 *
	 * @param {Object} ctx - autoComplete.js context
	 */
	async function init (ctx) {
	  const { placeHolder, resultsList } = ctx;

	  const parentAttrs = {
	    role: "combobox",
	    "aria-owns": resultsList.id,
	    "aria-haspopup": true,
	    "aria-expanded": false,
	  };

	  // Set "input" attributes
	  create(ctx.input, {
	    "aria-controls": resultsList.id,
	    "aria-autocomplete": "both",
	    ...(placeHolder && { placeholder: placeHolder }),
	    ...(!ctx.wrapper && { ...parentAttrs }),
	  });

	  // Create wrapper element
	  if (ctx.wrapper) ctx.wrapper = create("div", { around: ctx.input, class: ctx.name + "_wrapper", ...parentAttrs });

	  if (resultsList)
	    // Create new list element
	    ctx.list = create(resultsList.tag, {
	      dest: [resultsList.destination, resultsList.position],
	      id: resultsList.id,
	      role: "listbox",
	      hidden: "hidden",
	      ...(resultsList.class && { class: resultsList.class }),
	    });

	  // Attach Events listeners
	  addEvents(ctx);

	  // Get the data from store
	  if (ctx.data.cache) await getData(ctx);

	  /**
	   * @emit {init} event on Initialization
	   **/
	  eventEmitter("init", ctx);
	}

	/**
	 * autoComplete.js API extension
	 *
	 * @param {Object} autoComplete - autoComplete.js object instance
	 */
	function extend (autoComplete) {
	  const { prototype } = autoComplete;

	  // Initialize autoComplete.js engine
	  prototype.init = function () {
	    init(this);
	  };

	  /**
	   * Start autoComplete.js engine
	   *
	   * @param {String} query - Search query value
	   *
	   */
	  prototype.start = function (query) {
	    start(this, query);
	  };

	  // Un-Initialize autoComplete.js engine
	  prototype.unInit = function () {
	    if (this.wrapper) {
	      const parentNode = this.wrapper.parentNode;

	      parentNode.insertBefore(this.input, this.wrapper);
	      parentNode.removeChild(this.wrapper);
	    }

	    removeEvents(this);
	  };

	  // Open closed list
	  prototype.open = function () {
	    open(this);
	  };

	  // Close opened list
	  prototype.close = function () {
	    close(this);
	  };

	  /**
	   * Go to result item by index
	   *
	   * @param {Number} index - of the selected result item
	   *
	   */
	  prototype.goTo = function (index) {
	    goTo(index, this);
	  };

	  // Go to next result item
	  prototype.next = function () {
	    next(this);
	  };

	  // Go to previous result item
	  prototype.previous = function () {
	    previous(this);
	  };

	  /**
	   * Select result item with given index or current cursor
	   *
	   * @param {Number} index - of the selected result item
	   *
	   */
	  prototype.select = function (index) {
	    select(this, null, index);
	  };

	  /**
	   * autoComplete.js Search Engine
	   * Find matching characters in record
	   *
	   * @param {String} query - Search query value
	   * @param {String} record - Data record string
	   * @param {Object} options - Search Engine configuration options
	   *
	   * @returns {String} - Matching data record
	   */
	  prototype.search = function (query, record, options) {
	    return search(query, record, options);
	  };
	}

	/**
	 * @class autoComplete
	 * @classdesc Creates a new instance of autoComplete.js with the given configuration.
	 *
	 * @see {@link https://tarekraafat.github.io/autoComplete.js/#/configuration} for more information on configuration options.
	 * @example const autoCompleteJS = new autoComplete({config});
	 *
	 * @param {Object} config - Configuration options.
	 * @param {Number|String} [config.id] - Auto assigned instance unique identifier.
	 * @param {String} [config.name=autoComplete] - Prepended to all created DOM element class names.
	 * @param {(String|Function)} [config.selector=#autoComplete] - Must point to or return the relevant input field or element that autoComplete.js should act upon.
	 * @param {Object} config.data - Data source.
	 * @param {(String[]|Object[]|Function)} config.data.src - Values to search or an async or immediate function that returns an array of values to search.
	 * @param {String[]} [config.data.keys] - Only used if config.data.src is an array of objects. Specifies which keys in the objects autoComplete.js should search.
	 * @param {Boolean} [config.data.cache=false] - If true, autoComplete.js fetches all config.data.src when initialized and never again.
	 * @param {Function} [config.data.filter] - Used to filter and sort matching returns from config.data.src before showing them to the user. Signature: (Array), is given all the results from config.data.src that matches the query.
	 * @param {Function} [config.trigger] - Return true if you want autoComplete.js to start. Signature: (event, query). Default trigger function returns true if input field is *NOT* empty *and* greater than or equal to config.threshold.
	 * @param {Function} [config.query] - For manipulating the input value before running the search, for example if you want to remove spaces or anything else. Signature: (string), must return string, is given the raw input value.
	 * @param {String} [config.placeHolder] - Placeholder to set on the input element. For example "Search...".
	 * @param {Number} [config.threshold=1] - Minimum number of characters required in the input before triggering autocompletion.
	 * @param {Number} [config.debounce=0] - Delay in milliseconds after input for autocompletion to start.
	 * @param {Boolean} [config.wrapper=true] - Wraps the input element in a div for a11y purposes, adding some ARIA attributes.
	 * @param {(String|Function)} [config.searchEngine=strict] - "strict" checks if the given query is contained within the data, "loose" returns every result where every character in the query is present in the data in any order and location. Signature: (query: string, record: any), given the manipulated query input and each data.src array entry or for each entry[config.data.keys].
	 * @param {Boolean} [config.diacritics=false] - Enable to normalize query and data values using String.normalize and by removing u0300 through u036f. See {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize}.
	 * @param {(Object|Boolean)} [config.resultsList] - false to disable result list rendering.
	 * @param {String} [config.resultsList.tag=ul] - HTML tag to use for rendering the result container.
	 * @param {String} [config.resultsList.id=autoComplete_list_index] - ID given to the result container.
	 * @param {String} [config.resultsList.class] - Class names to give to the result container.
	 * @param {(String|Function)} [config.resultsList.destination=#autoComplete] - Selector that points to where you want to insert the result elements. Defaults to config.selector. Signature: ().
	 * @param {String} [config.resultsList.position=afterend] - Position relative to config.selector where to insert the results list. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement#parameters}.
	 * @param {Function} [config.resultsList.element] - Invoked before showing the results list. Allows manipulation of the DOM before it is added to the document. Signature: (list: HTMLElement, data: { query, matches, results }), where list is the container element.
	 * @param {Number} [config.resultsList.maxResults=5] - Maximum number of results to render.
	 * @param {Boolean} [config.resultsList.tabSelect=false] - Makes the Tab key select the entry navigated to using the keyboard, just like Enter.
	 * @param {Boolean} [config.resultsList.noResults=false] - If enabled the results list will render when there are zero matches. For example if you want to show a custom message or help to the user in config.resultsList.element.
	 * @param {Object} [config.resultItem] - Customize each rendered autocompletion result.
	 * @param {String} [config.resultItem.tag=li] - HTML tag to use for rendering each result.
	 * @param {String} [config.resultItem.id=autoComplete_result_index] - Prefix to use for the ID of each result element. _ and a number from 0 to maxResults is appended, so the final ID is for example "autoComplete_result_0" to "autoComplete_result_10".
	 * @param {String} [config.resultItem.class] - Class names to give to each result element.
	 * @param {Function} [config.resultItem.element] - Invoked before showing the results list. Allows manipulation of the DOM before it is added to the document. Signature: (item: HTMLElement, data: { match, value, [key] }).
	 * @param {(Boolean|String)} [config.resultItem.highlight=false] - Enable to highlight matching characters using HTMLMarkElement, or a string of CSS classes to add to any generated mark elements.
	 * @param {String} [config.resultItem.selected] - CSS classes to add and remove from result items the user navigates to using the keyboard.
	 * @param {Boolean} [config.submit=false] - If enabled pressing enter will not prevent default behavior.
	 * @param {Object} [config.events] - Allows adding custom or overriding internal event handling.
	 * @param {Object} [config.events.input] - Maps event names to event handlers for the input element. Each key must be a valid event name, see {@link https://developer.mozilla.org/en-US/docs/Web/Events}, and each value must be an event handler function. Default handlers are keydown and blur.
	 * @param {Object} [config.events.list] - Same as config.events.input, but for the result list container element. Default handlers are mousedown and click.
	 */
	function autoComplete(config) {
	  // User's Configuration options
	  this.options = config;
	  // Default Configuration options
	  this.id = autoComplete.instances = (autoComplete.instances || 0) + 1;
	  this.name = "autoComplete";
	  this.wrapper = 1;
	  this.threshold = 1;
	  this.debounce = 0;
	  this.resultsList = {
	    position: "afterend",
	    tag: "ul",
	    maxResults: 5,
	  };
	  this.resultItem = { tag: "li" };
	  // Set all Configuration options
	  configure(this);
	  // Stage API methods
	  extend.call(this, autoComplete);
	  // Initialize autoComplete.js
	  init(this);
	}

	function districtOut(districts) {
	    let inner = '<option value="" id="empty_district">Округ</option>';

	    for (const key of Object.keys(districts)) {
	        // console.log(district[key]['id'] + ' ' + district[key]['name'])
	        inner = inner + '<option value="' + districts[key]['id'] + '">' + districts[key]['name'] + '</option>';
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
	        inner = inner + '<option value="' + regions[key]['id'] + '">' + regions[key]['name'] + '</option>';
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
	        inner = inner + '<option value="' + cities[key]['id'] + '">' + cities[key]['name'] + '</option>';
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
	            this.options[this.selectedIndex].text;

	            if (district_id) {
	                let regions0 = districts[district_id];
	                if (regions0) {
	                    let regions = regions0['regions'];
	                    regionOut(regions);
	                    cityOutAndSave(regions);
	                }
	            }
	        });
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
	        });
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

	    new autoComplete(config_live_search);
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

	function fromDB() {
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
	}

	//import "../css/style.css"; /* extract the styles to a external css bundle */
	//import * as styles from "oswc2_styles/oswc2_styles.css"; /* import the styles as a string */
	//import {styles} from '../css/style.css' assert { type: "css" }; /* import the styles as a CSSStyleSheet */

	html();
	setTimeout(geoLoc(), 100);
	setTimeout(fromDB(), 1000);

	// reread data from db with regions or city data of executors or customers from city of localstorage

	/* <!-- js for esc on modal (in Home part of site that based on PicnicCSS) --> */
	document.onkeydown = function (event) {
	    if (event.key == "Escape") {
	        var mods = document.querySelectorAll('.modal > [type=checkbox]');
	        [].forEach.call(mods, function (mod) { mod.checked = false; });
	    }
	};

}));
