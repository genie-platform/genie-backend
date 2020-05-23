const config = require('config')
// const { web3 } = require('@services/web3')
const { toWei } = require('web3-utils')
const Erc20 = require('@assets/abi/erc20')
const { Funding } = require('genie-contracts-abi')
const BigNumber = require('bignumber.js')
const { createNetwork } = require('@utils/web3')
const { withAccount } = require('@services/account')
const linkPayment = toWei('1', 'ether')

const requestOracle = withAccount(async (account, pool) => {
  // const account = await Account.findOne({ isLocked: false })
  const { createContract, send, createMethod } = createNetwork(account)

  const poolContract = createContract(Funding, pool.contractAddress)
  const linkToken = createContract(Erc20, config.network.addresses.LinkToken)
  const chainlinkClient = await poolContract.methods.oracle().call()
  const balance = await linkToken.methods.balanceOf(chainlinkClient).call()
  console.log({ balance })

  // check if pool isOpen
  // fund the chainlink client
  if (new BigNumber(balance).isLessThan(linkPayment)) {
    const transferMethod = createMethod(linkToken, 'transfer', chainlinkClient, linkPayment)

    const transferReceipt = await send(transferMethod, {
      from: account.address
    })
    console.log({ transferReceipt })
  }

  // request the winner
  const requestWinnerMethod = createMethod(poolContract, 'requestWinner', linkPayment)

  const requestWinnerReceipt = await send(requestWinnerMethod, {
    from: account.address
  })

  console.log({ requestWinnerReceipt })
})

module.exports = {
  requestOracle
}
