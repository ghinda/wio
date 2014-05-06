/*
 * WIO adapter for
 * LocalStorage
 *
 */

WIO.adapter('localstorage', (function() {
  
  var storage = window.localStorage;

	var authorize = function(params, prev, callback) {

    // nothing to authorize
		callback(null, {});

	};
  
  var read = function(params, prev, callback) {
    
    var file = storage.getItem(params.path) || {};
    
    // compare with previous file
    if(prev.meta && file.meta) {
      
      if(new Date(prev.meta.modifiedDate) > new Date(file.meta.modifiedDate)) {
        
        // TODO cache and return the newer file
        file = prev;
        
        storage.setItem(params.path, JSON.stringify(file));
        
      }
      
    }
    
    callback(null, file);
    
  };

	var init = function(options) {

    

	};

	return {
    authorize: authorize,
		read: read,

		init: init
	}
})());
