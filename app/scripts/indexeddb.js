StorageBox.prototype.adapter.indexeddb = function() {

	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	var authorize = function(params, callback) {

	};

	var read = function(params, callback) {

		// read file from offline storage

		// create a new idb with the path as the name
		// since the path will always be unique
		var request = indexedDB.open(params.path, 2);

		request.onerror = function(event) {
			// Handle errors.
		};

		request.onupgradeneeded = function(event) {
			// when object is new, create store
			var db = event.target.result;
			var objectStore = db.createObjectStore('file', { keyPath: 'path' });
		};

		request.onsuccess = function(event) {
			var db = event.target.result;
			var transaction = db.transaction(['file'], 'readwrite');

			transaction.objectStore('file').get(params.path).onsuccess = function(event) {

				var updateRemote = false;

				if(event.target.result) {
					// file already exists

					// simple date conflict resolution
					if(params.meta.modifiedDate < event.target.result.meta.modifiedDate) {
						// update remote file
						updateRemote = true;

						callback(null, {
							updateRemote: true,
							file: event.target.result
						});
					}
				}

				if(!updateRemote) {
					update(params, function(err, response) {
						callback(null, {
							file: response.file
						});
					});
				}
			};

		};

	};

	var update = function(params, callback) {

		// write file to offline storage
		// no conflict resolution

		// create a new idb with the path as the name
		// since the path will always be unique
		var request = indexedDB.open(params.path, 2);

		request.onerror = function(event) {
			// Handle errors.
		};

		request.onupgradeneeded = function(event) {
			// when object is new, create store
			var db = event.target.result;
			var objectStore = db.createObjectStore('file', { keyPath: 'path' });
		};

		request.onsuccess = function(event) {
			var db = event.target.result;
			var transaction = db.transaction(['file'], 'readwrite');

			transaction.objectStore('file').put(params).onsuccess = function(e) {
				callback(null, {
					file: e.target.result
				});
			};

		};

	};

	var remove = function(params, callback) {



	};

	return {
		authorize: authorize,
		read: read,
		update: update,
		remove: remove
	}
}();
