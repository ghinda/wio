wio
===

**This is a work-in-progress and not ready for any kind of use!**

[wio]() is a JavaScript library that provides access to files on cloud storage services, with offline caching, through a unified API.

[wio adapters]() are plugins that implement individual cloud services (e.g. Google Drive, Dropbox, GitHub, etc.), local caching (e.g. LocalStorage, IndexedDB, etc.) or manipulate files (e.g. encryption).

## Development

  grunt server

## Build

  grunt

## Quickstart


```
var io = new wio({
  adapters: [
    'localstorage',
    'gdrive'
  ],
  options: {
    'gdrive': {
      clientId: '1234567890.apps.googleusercontent.com'
    }
  }
});

io.authorize({}, function(err, response) {

  io.read({
    path: '/test/test.txt'
  }, function(err, response) {

    console.log(response);

  });

});
```
