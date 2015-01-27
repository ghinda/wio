wio
===

**This is a work-in-progress and not ready for any kind of use!**

[wio]() is a JavaScript library that provides access to files on cloud storage services, with offline caching (among other things), through a unified API.

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

The order of the `adapters` matters only for the `list` request.

## Technical details

Here is how `wio` handles some things internally:

### Read

The `read` method will read the data from each of the adapters, and return only the *newest* response. `wio` finds the newest response by comparing the `meta.modifiedDate` property returned in the response from each adapter.

After it returns the newest response, it will call the `update` method on all the other adapters, to try and get the same data everywhere.


### List

The `list` method will return the data returned from the adapter with the *highest priority*. The adapter priority is based on the order in which they are specified in the `adapters` property of the initialization properties.

The first adapter in the array has the highest priority.


### Error handling

`wio` uses Node.js-style callbacks, meaning each callback will look like:

```
function(err, response) {}
```

The `err` object will be either `null`, or an array of objects. Each object in the array will look like:

```
{
  adapter: 'localstorage',
  error: { ... }
}
```

This is because of the multiple adapter architecture. While an adapter can return an error, the others can work fine, so it's up to you to handle the individual errors from each of the adapters.


### Binary data

`wio` supports both text content or binary data for the files.


### WIP Normalized file objects

// From Read/Update/Delete operations

{
  meta: {
    path: 'isostring',
    name: '?',
    createdDate: 'isostring',
    modifiedDate: 'isostring',
    type: 'folder' || 'file'
  },
  content: ''
}

// The list operation returns only the `meta` object, but without nesting it under a `meta` property

