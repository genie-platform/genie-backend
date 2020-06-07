const config = require('config')
const { toWei } = require('web3-utils')
const Erc20 = require('@assets/abi/erc20')
const { Funding } = require('genie-contracts-abi')
const BigNumber = require('bignumber.js')
const { createNetwork } = require('@utils/web3')
const { withAccount } = require('@services/account')

/**
 * Sends dai to user with address userAddress
 *
 * Checks if user has less dai than the pool ticket price,
 * and sends that amount to the user if true
 */
const sendDaiFaucet = withAccount(async (account, poolAddress, userAddress) => {
  const { createContract, send, createMethod } = createNetwork(account)

  const poolContract = createContract(Funding, poolAddress)
  const daiToken = createContract(Erc20, config.network.addresses.DaiToken)

  // get pool ticket price
  const ticketPrice = await poolContract.methods.ticketPrice().call()

  // check if user have less dai than the ticket price
  const userBalance = await daiToken.methods.balanceOf(userAddress).call()

  if (new BigNumber(userBalance).isLessThan(ticketPrice)) {
    // send user [ticket price] DAI
    const transferMethod = createMethod(daiToken, 'transfer', userAddress, ticketPrice)

    const transferReceipt = await send(transferMethod, {
      from: account.address
    })
    console.log({ transferReceipt })

    return transferReceipt
  }
})

/**
 * Sends eth to user with address userAddress
 *
 * Checks if user have enought eth to join the pool
 * If the user doesn't have enough eth, he sends it to the user
 */
const sendEthFaucet = withAccount(async (account, userAddress) => {
  const { web3 } = createNetwork(account)

  const faucetAmount = toWei(config.get('network.faucets.eth.amount'))

  // check if user have enought eth to join the pool
  const userBalance = await web3.eth.getBalance(userAddress)

  if (new BigNumber(userBalance).isLessThan(faucetAmount)) {
    const transferReceipt = await web3.eth.sendTransaction({
      from: account.address,
      to: userAddress,
      value: faucetAmount,
      gas: 21000
    })

    return transferReceipt
  }
})

module.exports = {
  sendDaiFaucet,
  sendEthFaucet
}
