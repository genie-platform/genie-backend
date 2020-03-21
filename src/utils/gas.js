const request = require('request-promise-native')
const config = require('config')

const fetchGasPrice = async (speed) => {
  const url = config.get('network.gasStation')
  const response = JSON.parse(await request.get(url))
  const gas = response[speed]
  // special treatment for https://ethgasstation.info/
  if (url.includes('ethgasstation')) {
    return gas / 10
  }
  return gas
}

module.exports = {
  fetchGasPrice
}
