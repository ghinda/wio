/*
 * wio.js
 * unified file manipulation api
 */

var WIO = function(params) {
	'use strict';

	/* normalize metadata
	 */
	var normalize = function(meta) {
		normalizedMeta = JSON.parse(JSON.stringify(meta));

		// createdDate
		normalizedMeta.createdDate = meta.createdDate;

		// modifiedDate
		normalizedMeta.modifiedDate = meta.modifiedDate;

		return normalizedMeta;
	};

	/* simple extend for default params
	 */
	var defaults = function(destination, source) {
		destination = destination || {};
		for (var property in source) {
			if(typeof destination[property] === "undefined") {
				destination[property] = source[property];
			}
		}

		return destination;
	};

	// async run all adapters
	var runAdapters = function(run, params, callback) {

		var i = 0;

		var runner = function(err, file) {

			if(err) {
				return callback(err);
			}

			// TODO find a general condition to check if the previous file is newer
			// so I don't have to manually check the previous file in each adapter
			// TODO only to be used for READ
			// * in case the file is newer somewhere else
			// * we'll trigger the UPDATE on all the checked adapters
			// - with the newst - up to this point - file 
			// (so the newest version is updated on all adapters everywhere)
			
      file = file || {};

			if(i < adapters.length - 1) {
        // start with the second adapter
        i++;
				return WIO.adapters[adapters[i]][run](params, file, runner);
			} else {
				return callback(err, file);
			}

		};

    // run the first adapter
    WIO.adapters[adapters[i]][run](params, {}, runner);


	};

	var authorize = function(params, callback) {

		params = defaults(params, {
			silent: false
		});

		// async run adapters
    runAdapters('authorize', params, callback);

	};
  
  var read = function(params, callback) {

    params = defaults(params, {});

    // async run adapters
    runAdapters('read', params, callback);

  };

//   var read = function(params, callback) {
// 
//     params = defaults(params, {
//       path: ''
//     });
// 
//     adapter.read(params, function(err, file) {
// 
//       file = file || {};
//       file.path = params.path;
// 
//       // do offline stuff
//       offlineAdapter.read(file, function(err, response) {
//         if(err) return false;
// 
//         // if the offline cached version is newer, update the remote one
//         if(response.updateRemote) {
//           adapter.update({
//             path: file.path,
//             content: response.file.content
//           }, function(err, response) {
//             console.log('cache update error', err);
//             console.log('cache update response', response);
//           });
//         }
//       });
// 
//       callback(err, file);
// 
//     });
// 
//   };
  
//
// 	var update = function(params, callback) {
//
// 		params = defaults(params, {
// 			path: '',
// 			content: ''
// 		});
//
// 		adapter.update(params, function(err, meta) {
//
// 			params.meta = meta;
//
// 			// do offline stuff
// 			offlineAdapter.update(params, function(err, response) {
// 				if(err) return false;
// 			});
//
// 			callback(err, params);
//
// 		});
//
// 	};
//
// 	var remove = function(params, callback) {
//
// 		params = defaults(params, {
// 			path: ''
// 		});
//
// 		adapter.remove(params, function(err, file) {
//
// 			// offline stuff
//
// 			callback(err, file);
//
// 		});
//
// 	};

	// TODO list

	//console.log(params.adapters);

	// public methods
	wio = {
		authorize: authorize,
		read: read
		
// 		update: update,
// 		remove: remove
	}

	// init adapters, and allow them to manipulate public methods
	var adapters = params.adapters;
	adapters.forEach(function(adapterName) {
 		WIO.adapters[adapterName].init(params.options[adapterName], wio);
	});

	return wio;

};

WIO.adapters = {};

WIO.adapter = function(id, obj) {

	// TODO check if adapter has all required methods

	// methods required to implement a wio adapter
    var implementing = 'authorize'.split(' ');

    // mix in the adapter
    implementing.forEach(function(prop) {
        if(!obj.hasOwnProperty(prop)) {
			throw 'Invalid adapter! Missing method: ' + prop
		}
    });

    WIO.adapters[id] = obj;

};
