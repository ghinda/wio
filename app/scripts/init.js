/*
 * Init
 */

var wio = new WIO({
  adapters: [
    'crypto',
    'localstorage',
    'gdrive'
  ],
  options: {
    'gdrive': {
      clientId: '1016266345728-6obbdsicgtsquer95qda26iaknnbcgg0.apps.googleusercontent.com'
    }
  }
});

wio.authorize({
  silent: true
}, function(err, response) {

  if(err) return false;

  wio.read({
    path: 'rssr/read.json'
  }, function(err, response) {
    
    console.log('read');
    
    console.log(err);
    
    console.log(response);
    
  });
  
//
// 		console.log('read error', err);
// 		console.log('read response', response);
//
// 		if(err) {
// 			wio.update({
// 				path: 'rssr/read.json',
// 				content: 'mycontent ' + new Date().toISOString()
// 			}, function(err, response) {
// 					console.log('update error', err);
// 					console.log('update response', response);
// 			});
// 			return false;
// 		}
//
// 		wio.remove({
// 			path: 'rssr/read.json'
// 		}, function(err, response) {
// 				console.log('remove error', err);
// 				console.log('remove response', response);
//
// 				wio.update({
// 					path: 'rssr/read.json',
// 					content: 'mycontent ' + new Date().toISOString()
// 				}, function(err, response) {
// 						console.log('update error', err);
// 						console.log('update response', response);
// 				});
//
// 		});
//
// 	});

});
