const CurrencyPairData = require('../es6/CurrencyPairData');

describe('class StockData', () => {
  let PricesData;

  beforeEach(() => {
    PricesData = new CurrencyPairData();
  });

  test("Check variable type", () => {
    // Type check
    expect(Array.isArray(PricesData.msgDataArr)).toBe(true);
    expect(typeof PricesData.data.sparks.entries()).toBe('object');
  });

  test('dataPayload row', () => {
    const data = {
      body: '{"name":"gbpcad","bestBid":1.801755256107163,"bestAsk":1.8352216720508752,"openBid":1.8039885021665991,"openAsk":1.856611497833401,"lastChangeAsk":0.06650673915200667,"lastChangeBid":0.03767179796954334}'
    };
    PricesData.dataPayload(data, true); //true to skip Sparkling
    expect(PricesData.msgDataArr.length).toBe(1);

    const data2 = {
      body: '{"name":"gbpusd","bestBid":1.4787047974859897,"bestAsk":1.5250241999953476,"openBid":1.4585582320186588,"openAsk":1.4588417679813415,"lastChangeAsk":0.045795404807584816,"lastChangeBid":0.06029655343074358}'
    };
    PricesData.dataPayload(data2, true);
    expect(PricesData.msgDataArr.length).toBe(2);
  });

  test("loadSparklineArray should return an Array", () => {
    let arr = PricesData.loadSparklineArray('test', 1.23, 2.22, new Map());
    expect(arr.length).toBeGreaterThan(0);
  });

});
