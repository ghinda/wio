/*
* Init
*/

var wio = new WIO({
  adapters: [
  // 'crypto',
  // 'localstorage',
    'gdrive'
  ],
  options: {
    'gdrive': {
      clientId: '1016266345728-6obbdsicgtsquer95qda26iaknnbcgg0.apps.googleusercontent.com'
    }
  }
});

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

wio.authorize({
  silent: true
}, function(err, response) {

  if(err) return false;

  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  context.fillStyle = "green";
  context.fillRect(50, 50, 100, 100);
  var img = canvas.toDataURL("image/png");

  img = img.replace(/^data:image\/(png|jpg);base64,/, '');

  var blob = b64toBlob(img, 'image/png');
  //var blobUrl = URL.createObjectURL(blob);

  wio.update({
    path: 'rssr/test.png',
    mimeType: 'image/png',
    //content: img
    content: blob
  }, function(err, response) {

    console.log('update');

    console.log(err);

    console.log(response);

  });

  wio.update({
    path: 'rssr/read.json',
    content: 'ZER ZER ZER'
  }, function(err, response) {

    console.log('update');

    console.log(err);

    console.log(response);

  });

  return false;

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
