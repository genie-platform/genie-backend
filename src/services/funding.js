const config = require('config')
const DaiAbi = require('@assets/abi/dai')
const CDaiAbi = require('@assets/abi/cDai')
const mongoose = require('mongoose')
const BigNumber = require('bignumber.js')
const { web3 } = require('@services/web3')
const { createNetwork } = require('@utils/web3')

const Game = mongoose.model('Game')
const Account = mongoose.model('Account')

const daiToken = new web3.eth.Contract(DaiAbi, config.get('network.addresses.DaiToken'))
const cDaiToken = new web3.eth.Contract(CDaiAbi, config.get('network.addresses.CDaiToken'))

const getBalance = (accountAddress) => {
  return daiToken.methods.balanceOf(accountAddress).call()
}

const getInvestedBalance = (accountAddress) => {
  return cDaiToken.methods.balanceOfUnderlying(accountAddress).call()
}

const getNextPrize = async (accountAddress) => {
  const { fund } = await Game.findOne({ accountAddress })
  const investedBalance = await getInvestedBalance(accountAddress)
  return new BigNumber(investedBalance).minus(fund).toString()
}

const approveCDai = async (account) => {
  const MAX_INT_VALUE = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
  const { createContract, send, createMethod } = createNetwork(account)
  const daiTokenWithSigner = createContract(DaiAbi, config.get('network.addresses.DaiToken'))
  const approveMethod = createMethod(
    daiTokenWithSigner,
    'approve',
    config.get('network.addresses.CDaiToken'), MAX_INT_VALUE
  )

  const receipt = await send(approveMethod, {
    from: account.address
  })

  if (!receipt || !receipt.status) {
    throw new Error('Could not approve DAI')
  }
  account.isCDaiApproved = true
  return account.save()
}

const invest = async (accountAddress, balance) => {
  const account = await Account.findOne({ address: accountAddress })
  if (!account.isCDaiApproved) {
    await approveCDai(account)
  }
  const { createContract, send, createMethod } = createNetwork(account)
  const cDaiTokenWithSigner = createContract(CDaiAbi, config.get('network.addresses.CDaiToken'))
  const method = createMethod(cDaiTokenWithSigner, 'mint', balance)

  const receipt = await send(method, {
    from: account.address
  })

  if (!receipt || !receipt.status) {
    throw new Error('Could not invest DAI')
  }

  console.log('Investing was successful')
  const game = await Game.findOne({ accountAddress: account.address })
  game.fund = new BigNumber(game.fund).plus(balance).toString()
  return game.save()
}

const redeemPrize = async (accountAddress, prize) => {
  const account = await Account.findOne({ address: accountAddress })
  const { createContract, send, createMethod } = createNetwork(account)
  const cDaiTokenWithSigner = createContract(CDaiAbi, config.get('network.addresses.CDaiToken'))
  const method = createMethod(cDaiTokenWithSigner, 'redeemUnderlying', prize.amount)

  const receipt = await send(method, {
    from: account.address
  })

  if (!receipt || !receipt.status) {
    throw new Error('Could not redeem prize')
  }

  const daiTokenWithSigner = createContract(DaiAbi, config.get('network.addresses.DaiToken'))
  const transferMethod = createMethod(daiTokenWithSigner, 'transfer', prize.winnerAccountAddress, prize.amount)

  const transferReceipt = await send(transferMethod, {
    from: account.address
  })

  if (!transferReceipt || !transferReceipt.status) {
    throw new Error('Could not send the prize to winner')
  }

  if (transferReceipt) {
    prize.redeemed = true
    prize.save()
  } else {
    console.log('transfered prize failed')
  }
}

const redeemPrizes = async (winnerAccountAddress, accountAddress, prizes) => {
  for (let prize of prizes) {
    prize.winnerAccountAddress = winnerAccountAddress
    await redeemPrize(accountAddress, prize)
  }
}

module.exports = {
  getBalance,
  getInvestedBalance,
  getNextPrize,
  invest,
  redeemPrize,
  redeemPrizes
}
