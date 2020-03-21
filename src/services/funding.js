const config = require('config')
const DaiAbi = require('@assets/abi/dai')
const CDaiAbi = require('@assets/abi/cDai')
const mongoose = require('mongoose')
const BigNumber = require('bignumber.js')
const { web3 } = require('@services/web3')
const { createNetwork } = require('@utils/web3')

const Game = mongoose.model('Game')
const daiToken = new web3.eth.Contract(DaiAbi, config.get('network.addresses.DaiToken'))
const cDaiToken = new web3.eth.Contract(CDaiAbi, config.get('network.addresses.CDaiToken'))

const getBalance = (accountAddress) => {
  return daiToken.methods.balanceOf(accountAddress).call()
}

const getInvestedBalance = (accountAddress) => {
  return cDaiToken.methods.balanceOfUnderlying(accountAddress).call()
}

const invest = async (account, balance) => {
  const { createContract, send, createMethod } = createNetwork(account)
  debugger
  const cDaiTokenWithSigner = createContract(CDaiAbi, config.get('network.addresses.CDaiToken'))
  const method = createMethod(cDaiTokenWithSigner, 'mint', balance)

  const receipt = await send(method, {
    from: account.address
  })
  console.log({ receipt })
  if (receipt) {
    console.log('Investing was successful')
    const game = await Game.findOne({ accountAddress: account.address })
    game.fund = new BigNumber(game.fund).plus(balance).toString()
    await game.save()
  } else {
    console.log('Investing failed')
  }
}

module.exports = {
  getBalance,
  getInvestedBalance,
  invest
}
