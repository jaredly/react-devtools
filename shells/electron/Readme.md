# React Devtools as a Stand-Alone App

This electron-based app can be used in a number of applications that are ourside the debugging comfort of chrome or firefox, including:

- electron-based apps
- React Native w/o using chrome (i.e. js that is run on device)
- WebViews within a mobile app

## Prereqs

You'll need webpack, and [electron](http://electron.atom.io/#get-started) (`npm install electron-prebuilt -g`).

## Using
You'll need to run `npm install` and `webpack` to get everything started.

### With React Native

With the packager running, run `electron .` and then refresh your app.

### Everywhere else

```
electron . --server
```

Once it starts up, it will print to the console a script tag for you to put in your html page. It's important that this script tag go *before* React is loaded on the page.

This HTML page can be in an electron app, a WebView, or wherever you want. As long as the environment supports `WebSocket`, you'll be good to go.
