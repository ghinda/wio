/*
 * wio filepicker demo
 */


(function() {
  'use strict';

  var io;

  var $list = document.querySelector('.file-list');

  var listFiles = function(path) {

    $list.innerHTML = 'loading..';

    io.list({
      path: path
    }, function(err, listRes) {

      console.log('list', err, listRes);

      $list.innerHTML = '';

      // add .. up link
      if(path !== '/' && path !== '') {

        var $li = document.createElement('li');
        var $a = document.createElement('a');

        $a.innerHTML = '..';

        $a.href = '#';

        $a.addEventListener('click', function() {

          listFiles('/');

        });

        $li.appendChild($a);
        $list.appendChild($li);

      }

      listRes.forEach(function(file) {

        var $li = document.createElement('li');
        var $a = document.createElement('a');

        var typeIcon = '';
        
        if(file.type === 'folder') {
          typeIcon = '&#128193;';
        } else {
          typeIcon = '&#9782;';
        }
        
        $a.innerHTML = '<strong>' + typeIcon + '</strong>&nbsp;' + file.name;

        $li.appendChild($a);
        $list.appendChild($li);

        $a.href = '#';
        
        // only if file is folder
        if(file.type === 'folder') {

          $a.addEventListener('click', function() {

            var newListPath = path;

            // only if last char isn't already /
            if(path[path.length - 1] !== '/') {
              newListPath += '/';
            }

            newListPath += file.name;

            listFiles(newListPath);

          });
          
        } else {
          
          $a.addEventListener('click', function() {

            var newListPath = path;

            // only if last char isn't already /
            if(path[path.length - 1] !== '/') {
              newListPath += '/';
            }

            newListPath += file.name;
            
            io.read({
              path: newListPath
            }, function(err, res) {
              
              // TODO detect file type depending on extension
              
              // TODO we export gdocs as pdf
              // check for %PDF- string at begining of file, for pdf
              console.log('file content', res);
              
            });

          });
          
        }

      });


    });

  };
  
  var selectAdapter = function(e) {
    
    if(e.target.tagName.toLowerCase() === 'button') {
      
      var adapter = e.target.getAttribute('data-adapter'); 
      
      io = wio({
        adapters: [
          //'crypto',
          adapter,
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
        silent: true
      },function(err, authRes) {

        if(err) {
          return false;
        }

        listFiles('/');
        
      });
      
    }
    
  };

  var init = function() {
    
    var adapterSelectBox = document.querySelector('.adapter-select');
    
    adapterSelectBox.addEventListener('click', selectAdapter);
    
  }();

}());
