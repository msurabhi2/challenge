const Sparkline = require('../site/sparkline');

class CurrencyPairData {
  constructor() {
    this.data = {};
    this.msgDataArr = [];
    this.sparkData = [];
    this.data.sparks = new Map();
  }

  dataPayload(message, testing = false) {
    const msgData = JSON.parse(message.body)
    let stockName = msgData.name
    msgData.msgId = `stomp-id-${stockName}`
    msgData.timeStamp = Date.now()
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
          if (k !== 'openBid' && k !== 'openAsk' && k !== 'msgId' && k !== 'timeStamp') {
            cols.push(k);
          }
          if (cols.length === 5) {
            cols.push("Sparkline (Last 30 sec data)")
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
            Sparkline.draw(tabCell, this.loadSparklineArray(dataPayload[row].msgId, dataPayload[row].bestAsk, dataPayload[row].bestBid, sparks))
          }
        }
      }

      //Finally display newly and sorted json data to the browser
      let divContainer = document.getElementById('stomp-status');
      divContainer.innerHTML = "";
      divContainer.appendChild(table);
    }
  }

  loadSparklineArray( msgId, bestAsk, bestBid, sparks) {
    let calculateMidPrice = (bestAsk + bestBid) / 2;
    let currentImage = sparks.get(msgId);
    if (typeof currentImage === 'undefined') {
      currentImage = [0];
      sparks.set(msgId, currentImage);
    }
    
    //Pushed data with current timeStamp
    currentImage.push({'data': calculateMidPrice.toFixed(2), 'timeStamp': Date.now()});
    if (currentImage.length >= 15) {
      currentImage.shift();
    }

    //filtering data which is less than 30 seconds with current timeStamp
    currentImage = currentImage.filter((d) => {
      return (Date.now() - d.timeStamp) < 30000
    });
    
    currentImage.forEach((sparkData) => { 
      this.sparkData.push(sparkData.data)
      if ( this.sparkData.length >= 15) {
        this.sparkData.shift(); //Removing old data due to which array length is exceeding
      }
    });
    return this.sparkData;
  }

}
module.exports = CurrencyPairData;