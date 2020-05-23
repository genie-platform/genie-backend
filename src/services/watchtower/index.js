require('module-alias/register')
const config = require('config')
const mongoose = require('../mongoose')
const { poeAdapter } = require('./adapter')
const { requestOracle } = require('../pool')
const Pool = mongoose.model('Pool')

const handleDone = async (status, response, pool) => {
  // no winner to the game
  console.log({ response })
  if (!response.data) {
    return
  }
  // format bytes32 to account address
  const winnerAccount = '0x' + response.data.substring(26)
  console.log({ winnerAccount })

  await requestOracle(pool)
  pool.isClosed = true
  pool.save()
}

const lookupWinners = async () => {
  const watchedPools = await Pool.find({ watchTower: true, game: config.get('games.poe.name'), isClosed: false })
  for (let pool of watchedPools) {
    console.log({ pool })
    await poeAdapter({
      data: {
        level: pool.winningCondition.value,
        pool: pool.contractAddress
      }
    }, (...args) => handleDone(...args, pool))
  }
}

module.exports = {
  lookupWinners
}
