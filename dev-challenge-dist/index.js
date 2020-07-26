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
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = true

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
const msgDataArr = []
const sparklineArr = [];

client.debug = function (msg) {
  console.log(msg)
  if (global.DEBUG) {
    console.info(msg)
  }
}

//Create connection
client.connect('guest', 'guest', connectCallback);

function connectCallback(message) {
  var subscription = client.subscribe("/fx/prices", dataPayload);
}

//Handling data payload
function dataPayload(message) {
  const msgData = JSON.parse(message.body)

  const cols = [];
  const colsData = [];
  const size = Object.keys(msgDataArr).length;

  msgDataArr.push(msgData)
  for (var i = 0; i < size; i++) {
    for (var k in msgDataArr[i]) {
      if (cols.indexOf(k) === -1) {
        //Calling createSparkline method and passed bestBid and bestAsk
        createSparkline(msgDataArr[i].bestBid, msgDataArr[i].bestAsk)
        msgDataArr.sort(function (a, b) {
          return a.lastChangeBid - b.lastChangeBid
        })

        msgDataArr.splice(10, 2);
        // Push all keys to the array 
        if (k !== 'openBid' && k !== 'openAsk') {
          cols.push(k);

        }


      }
    }
  }
  //Calling create tabel and passing data into it
  createTable(cols, msgDataArr)
}

//Function to display table to the browser
function createTable(cols, msgDataArr) {
  var table = document.createElement("table");

  // Create table headers

  var tr = table.insertRow(-1);                   // Table row.

  for (var i = 0; i < cols.length; i++) {
    var th = document.createElement("th");      // Table header.
    th.innerHTML = cols[i];
    tr.appendChild(th);
  }

  // add data into rows
  for (var i = 0; i < 10; i++) {

    tr = table.insertRow(-1);

    for (var j = 0; j < cols.length; j++) {
  
      var tabCell = tr.insertCell(-1);
      tabCell.innerHTML = msgDataArr[i][cols[j]];
    }
  }

  //Finally display newly and sorted json data to the browser
  var divContainer = document.getElementById('stomp-status');
  divContainer.innerHTML = "";
  divContainer.appendChild(table);
}

//Function to display Sparkline
function createSparkline(bestBid, bestAsk) {
  let sparklineResult = (bestBid + bestAsk) / 2;
  sparklineArr.push(sparklineResult);
  if (sparklineArr.length > 30) {
    sparklineArr.shift();
  }

  setInterval(function () {
    const exampleSparkline = document.getElementById('example-sparkline')
    const sparkline = new Sparkline(exampleSparkline);
    sparkline.draw(sparklineArr)
  }, 3000);

}


