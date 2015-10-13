/*
 * wio filepicker demo
 */

;(function () {
  'use strict'

  var Wio = window.Wio

  var io

  var $list = document.querySelector('.file-list')
  var $filePreview = document.querySelector('.file-preview')

  var listFiles = function (path) {
    $list.innerHTML = 'loading..'

    io.list({
      path: path
    }, function (err, listRes) {
      console.log('list', err, listRes)

      $list.innerHTML = ''

      // add .. up link
      if (path !== '/' && path !== '') {
        var $li = document.createElement('li')
        var $a = document.createElement('a')

        $a.innerHTML = '..'

        $a.href = '#'

        $a.addEventListener('click', function () {
          listFiles('/')
        })

        $li.appendChild($a)
        $list.appendChild($li)
      }

      listRes.forEach(function (file) {
        var $li = document.createElement('li')
        var $a = document.createElement('a')

        var typeIcon = ''

        if (file.type === 'folder') {
          typeIcon = '&#128193;'
        } else {
          typeIcon = '&#9782;'
        }

        $a.innerHTML = '<strong>' + typeIcon + '</strong>&nbsp;' + file.name

        $li.appendChild($a)
        $list.appendChild($li)

        $a.href = '#'

        // only if file is folder
        if (file.type === 'folder') {
          $a.addEventListener('click', function () {
            var newListPath = path

            // only if last char isn't already /
            if (path[path.length - 1] !== '/') {
              newListPath += '/'
            }

            newListPath += file.name

            listFiles(newListPath)
          })
        } else {
          $a.addEventListener('click', function () {
            var newListPath = path

            // only if last char isn't already /
            if (path[path.length - 1] !== '/') {
              newListPath += '/'
            }

            newListPath += file.name

            io.read({
              path: newListPath
            }, function (err, file) {
              if (err) {
                console.log(err)
              }

              var reader = null

              $filePreview.innerHTML = ''

              // TODO detect file type depending on extension
              if (file.meta.name.indexOf('.png') !== -1) {
                reader = new window.FileReader()

                var $image = document.createElement('img')

                reader.readAsDataURL(file.content)
                reader.onloadend = function () {
                  var base64data = reader.result
                  $image.src = base64data

                  $filePreview.appendChild($image)
                }
              }

              if (
                  file.meta.name.indexOf('.txt') !== -1 ||
                  file.meta.name.indexOf('.json') !== -1
                ) {
                $filePreview.innerHTML = file.content
              }

              if (
                file.meta.name.indexOf('.pdf') !== -1 ||
                (file.meta.mimeType && file.meta.mimeType.indexOf('application/vnd.google-apps.document') !== -1)
              ) {
                console.log(file)

                var $embed = document.createElement('embed')

                reader = new window.FileReader()
                reader.readAsDataURL(file.content)
                reader.onloadend = function () {
                  var base64data = reader.result
                  $embed.src = base64data

                  $filePreview.appendChild($embed)
                }
              }

              // TODO we export gdocs as pdf
              // check for %PDF- string at begining of file, for pdf
              console.log('file content', file)
            })
          })
        }
      })
    })
  }

  var selectAdapter = function (e) {
    if (e.target.tagName.toLowerCase() === 'button') {
      var adapter = e.target.getAttribute('data-adapter')

      io = new Wio({
        adapters: [
          // 'crypto',
          adapter,
          'localstorage'
        ],
        options: {
          gdrive: {
            // scopes: 'https://www.googleapis.com/auth/drive.file',
            clientId: '1016266345728-6obbdsicgtsquer95qda26iaknnbcgg0.apps.googleusercontent.com'
          },
          dropbox: {
            appKey: 'bjjs4f9vkw2gqre'
          }
        }
      })

      io.authorize({
      }, function (err, authRes) {
        if (err) {
          return false
        }

        listFiles('/')
      })
    }
  }

  var init = function () {
    var adapterSelectBox = document.querySelector('.adapter-select')

    adapterSelectBox.addEventListener('click', selectAdapter)
  }

  init()

}()); // eslint-disable-line
