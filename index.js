const blt = require('./binance-live-tracker')()

const binanceKeys = {
  APIKEY:'your binance api key',
  APISECRET:'your binance api secret'
}

const options = {
  binance:binanceKeys,
  spot:{
    myOrders:true
  }
}

blt.setOptions(options)
blt.init()

blt.events.on('spot.myOrders', data => console.log(data))

blt.spot.rateLimits(data => console.log(data))
