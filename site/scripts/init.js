/*
* Init
*/

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


(function() {
  'use strict';

  var io = new wio({
    adapters: [
      //'crypto',
      'gdrive',
      //'dropbox',
      'localstorage'
    ],
    options: {
      gdrive: {
        //scopes: 'https://www.googleapis.com/auth/drive.file',
        clientId: '1016266345728-6obbdsicgtsquer95qda26iaknnbcgg0.apps.googleusercontent.com'
      },
      dropbox: {
        appKey: 'bjjs4f9vkw2gqre'
      }
    }
  });

  io.authorize({
    //silent: true
  },function(err, authRes) {

    if(err) {
      return false;
    }

    io.list({
      path: '/'
    }, function(err, listRes) {

      console.log('list', err, listRes);

    });

    io.update({
      path: 'wio/test.json',
      content: 'test',
    }, function(err, updateRes) {
      
      console.log('update', err, updateRes);
      
      io.read({
        path: 'wio/test.json'
      }, function(err, readRes) {
        
        console.log('read', err, readRes);
        
        io.remove({
          path: 'wio/test.json'
        }, function(err, deleteRed) {
          
          console.log('delete', err, deleteRed);
          
        });
        
      });


    });
    
    io.update({
      path: 'test.png',
      content: blob,
      // required for gdrive
      mimeType: 'image/png'
    }, function(err, updateRes) {
      
      console.log('update binary', err, updateRes);
      
      io.read({
        path: 'test.png'
      }, function(err, readRes) {
        
        console.log('read binary', err, readRes);
        
      });


    });

  });

}());

