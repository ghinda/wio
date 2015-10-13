/*
 * localstorage plugin
 * for wio
 *
 */

// var util = require('./util')
var storage = window.localStorage

function authorize (params, callback) {
  // nothing to authorize
  callback(null, {})
}

function list (params, callback) {
  // should return an empty array
  // TODO or an error, if we can't find the path
  var files = []

  // get all files in localstorage
  var i = 0
  var fileName
  var storageContent

  for (i = 0; i < storage.length; i++) {
    fileName = storage.key(i)

    if (fileName.indexOf(params.path) !== -1) {
      storageContent = storage.getItem(fileName)

      if (storageContent) {
        storageContent = JSON.parse(storageContent)

        files.push(storageContent.meta)
      }
    }
  }

  callback(null, files)
}

function read (params, callback) {
  var err = null
  var file = storage.getItem(params.path)

  if (file) {
    file = JSON.parse(file)
  } else {
    err = {
      status: '404',
      path: params.path
    }
  }

  // TODO implement binary reading, for binary files
//   var responseType = util.responseType(params)

  callback(err, file)
}

function update (params, callback) {
  var modifiedDate = new Date().toISOString()

  if (params.meta && params.meta.modifiedDate) {
    modifiedDate = params.meta.modifiedDate
  }

  var file = {
    meta: {
      modifiedDate: modifiedDate
    },
    content: params.content
  }

  // TODO convert blobs to dataurls

  storage.setItem(params.path, JSON.stringify(file))

  // console.log('local file', file);

  callback(null, file)
}

function remove (params, callback) {
  var file = storage.removeItem(params.path)

  callback(null, file)
}

function init (options) {

}

module.exports = {
  authorize: authorize,
  list: list,
  read: read,
  update: update,
  remove: remove,

  init: init
}
