/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like

// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = true

const CurrencyPairData = require('./es6/CurrencyPairData');
const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
const currencyPairData = new CurrencyPairData();
client.debug = function (msg) {
  console.log(msg)
  if (global.DEBUG) {
    console.info(msg)
  }
}

//Create connection
client.connect('guest', 'guest', connectCallback);


function connectCallback(message) {
  var subscription = client.subscribe("/fx/prices", currencyPairData.dataPayload.bind(currencyPairData));
}



