const Sparkline = require('../site/sparkline');

class CurrencyPairData {
  constructor() {
    this.data = {};
    this.msgDataArr = [];
    this.data.sparks = new Map();
  }

  dataPayload(message, testing = false) {
    const msgData = JSON.parse(message.body)
    let stockName = msgData.name
    msgData.msgId = `stomp-id-${stockName}`
    const cols = [];

    this.msgDataArr.push(msgData)

    this.msgDataArr = this.getUniqueListBy(this.msgDataArr, 'name')

    for (let i in this.msgDataArr) {
      for (let k in this.msgDataArr[i]) {
        if (cols.indexOf(k) === -1) {
          //Sort by lastChangeBid
          this.msgDataArr.sort(function (a, b) {
            return a.lastChangeBid - b.lastChangeBid
          })

          // Push all keys to the array 
          if (k !== 'openBid' && k !== 'openAsk' && k !== 'msgId') {
            cols.push(k);
          }
          if (cols.length === 5) {
            cols.push("Sparkline")
          }
        }
      }
    }
    //create table with the runtime data
    this.createTable(cols, this.msgDataArr, this.data.sparks, testing)
  }

  getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }


  //Function to display table to the browser
  createTable(cols, dataPayload, sparks, testing) {
    if (!testing) {
      let table = document.createElement("table");
      // Create table headers
      let tr = table.insertRow(-1);                   // Table row.
      for (let header in cols) {
        let th = document.createElement("th");      // Table header.
        th.innerHTML = cols[header];
        tr.appendChild(th);
      }


      // add data into rows
      for (let row in dataPayload) {
        tr = table.insertRow();
        for (let column in cols) {
          let tabCell = tr.insertCell(-1);
          tabCell.innerHTML = dataPayload[row][cols[column]];
          if (column == 5) {
            Sparkline.draw(tabCell, this.loadSparklineArray(dataPayload[row].msgId, dataPayload[row].bestAsk, dataPayload[row].bestBid, sparks));
          }
        }
      }

      //Finally display newly and sorted json data to the browser
      let divContainer = document.getElementById('stomp-status');
      divContainer.innerHTML = "";
      divContainer.appendChild(table);
    }
  }

  loadSparklineArray(msgId, bestAsk, bestBid, sparks) {
    let calculateMidPrice = (bestAsk + bestBid) / 2;
    let currentImage = sparks.get(msgId);
    if (typeof currentImage === 'undefined') {
      currentImage = [0];
      sparks.set(msgId, currentImage);
    }
    currentImage.push(calculateMidPrice.toFixed(2));
    if (currentImage.length >= 10) { currentImage.shift(); }
    return currentImage;
  }

}
module.exports = CurrencyPairData;