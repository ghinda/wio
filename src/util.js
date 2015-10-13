/* wio utils
*/

function log () {
  window.console.log.apply(window.console, arguments)
}

// check if a file should be returned text or blob
// based on its extension
function responseType (params) {
  var textFiles = [
    'txt',
    'json'
  ]

  // default xhr responseType
  var response = 'blob'

  // if we have a responseType set in the method params
  if (params.responseType) {
    response = params.responseType
  } else {
    // get the filename from params.path
    var filename = params.path.split('/')
    filename = filename[filename.length - 1]

    var extension = filename.split('.')
    extension = extension[extension.length - 1]

    textFiles.some(function (ext) {
      if (extension === ext) {
        response = 'text'
        return true
      }

      return false
    })
  }

  return response
}

module.exports = {
  log: log,
  responseType: responseType
}
