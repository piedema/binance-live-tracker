const blt = require('./binance-live-tracker')()
const binanceKeys = require('../keys.json')

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
