/*
 * WIO adapter for
 * LocalStorage
 *
 */

WIO.adapter('localstorage', (function() {

	var authorize = function(params, callback) {

		callback(null, {});

	};

	var init = function(options) {



	};

	return {
		authorize: authorize,

		init: init
	}
})());
