function hideModal(id) {
	const mod_1 = document.getElementById(id);
	if (mod_1) {
		mod_1.checked = false;
	}
}

export function html() {
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
		hideModal("modal_1");
		newData('footer_city_message', inner_message_footer);
		newData('section_city_choice', inner_choice_section);
		newData('footer_city_choice', inner_choice_footer);
	});
};