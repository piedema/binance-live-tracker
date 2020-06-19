const binance = require('node-binance-api')()
const eventEmitter = new (require('events').EventEmitter)

module.exports = () => {

  const options = {
    binance:{},
    spot:{
      candles:false,
      prevdays:false,
      ticker:false,
      myBalances:false,
      myTrades:false,
      myOrders:false
    }
  }

  function init(){

    if(options.spot.candles === '*'){
      getMarkets(markets => binance.websockets.candlesticks(markets, '1m', (candlestick) => emitData(`spot.candles`, candlestick)))
    }

    if(Array.isArray(options.spot.candles)){
      binance.websockets.candlesticks(options.spot.candles, '1m', (candlestick) => emitData(`spot.candles`, candlestick))
    }

    if(options.spot.prevdays){
      binance.websockets.prevDay(options.spot.prevdays === '*' ? false : options.spot.prevdays, (error, response) => {
        if(error) console.log(error)
        if(response) emitData('spot.prevdays', response)
      })
    }

    if(options.spot.ticker) binance.websockets.miniTicker(markets => emitData('spot.ticker', markets))

    if(options.spot.myBalances || options.spot.myTrades || options.spot.myOrders){
      if(!options.binance.APIKEY || !options.binance.APISECRET) return console.log('Please provide APIKEY and APISECRET in options.binance.')

      binance.websockets.userData(data => {
      if(options.spot.balances) emitData('spot.myBalances', data)
      }, data => {
        if(options.spot.myTrades && data.x === 'TRADE') emitData('spot.myTrades', data)
        if(options.spot.myOrders) emitData('spot.myOrders', data)
      })
    }
  }

  function getMarkets(cb){
    let markets
    binance.exchangeInfo((error, response) => {
      if(error) return console.log(error)
      if(response){
        cb(response.symbols.map(info => { return info.symbol }))
      }
    })
  }

  function getExchangeInfo(cb){
    binance.exchangeInfo((error, response) => {
      if(error) return console.log(error)
      if(response) cb(response.symbols)
    })
  }

  function getRateLimits(cb){
    binance.exchangeInfo((error, response) => {
      if(error) return console.log(error)
      if(response) cb(response.rateLimits)
    })
  }

  function emitData(event, data){
    eventEmitter.emit(event, data)
  }

  function setOptions(opts){
    for(let opt in opts) options[opt] = opts[opt]
    if(opts.binance) binance.options(opts.binance)
    return options
  }

  return {

    init:() => {
      init()
    },

    setOptions:options => {
      return setOptions(options)
    },

    getOptions:() => {
      return options
    },

    spot:{
      rateLimits:cb => getRateLimits(rateLimits => cb(rateLimits)),
      exchangeInfo:cb => getExchangeInfo(exchangeInfo => cb(exchangeInfo)),
      markets:cb => getMarkets(markets => cb(markets))
    },

    events:eventEmitter
  }
}
