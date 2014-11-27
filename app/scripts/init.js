/*
* Init
*/

(function() {
  'use strict';

  var io = new wio({
    adapters: [
      'crypto',
      'gdrive',
      'localstorage'
    ],
    options: {
      'gdrive': {
        clientId: '1016266345728-6obbdsicgtsquer95qda26iaknnbcgg0.apps.googleusercontent.com'
      }
    }
  });

  io.authorize(function(err, response) {

    if(err) {
      return false;
    }

    io.update({
      path: 'rssr/test.json'
    }, function(err, response) {

      console.log('update', err, response);

      io.read({
        path: 'rssr/test.json'
      }, function(err, response) {

        console.log('read', err, response);

        io.delete({
          path: 'rssr/test.json'
        }, function(err, response) {

          console.log('delete', err, response);

        });

      });

    });

    io.list({
      path: 'rssr/'
    }, function(err, response) {

      console.log('list', err, response);

    });

    /*

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

    */

  });

}());
