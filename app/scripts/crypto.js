/*
 * WIO adapter for
 * Crypto
 *
 */

WIO.adapter('crypto', (function() {

	var authorize = function(params, callback) {

		callback(null, {});

	};

	var init = function(options, w) {

    // TODO should I switch to this model
    // so that I have full control on adapter execution order?
    var prevAuthorize = w.authorize;
    w.authorize = function(params, callback) {

      console.log('crypto authorize');

      prevAuthorize(params, callback);

    };

	};

	return {
		authorize: authorize,

		init: init
	}
})());
