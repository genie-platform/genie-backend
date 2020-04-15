const Web3 = require('web3')
const ethUtils = require('ethereumjs-util')
const config = require('config')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')
const { inspect } = require('util')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const { fetchGasPrice } = require('@utils/gas')
const wallet = fromMasterSeed(config.get('secrets.accounts.mnemonic'))

const createWeb3 = (providerUrl, account) => {
  const web3 = new Web3(providerUrl)
  let walletAccount
  if (account) {
    walletAccount = web3.eth.accounts.wallet.add(getPrivateKey(account))
    return { from: walletAccount.address.toLowerCase(), web3 }
  }
  return { web3 }
}

const createContract = ({ web3 }, abi, address) => {
  const contract = new web3.eth.Contract(abi, address, config.get(`network.contract.options`))
  return contract
}

const createMethod = (contract, methodName, ...args) => {
  console.log(`creating method ${methodName} with arguments: ${inspect(args)}`)

  let method
  if (methodName === 'deploy') {
    method = contract[methodName](...args)
  } else {
    method = contract.methods[methodName](...args)
  }
  method.methodName = methodName
  method.contract = contract
  return method
}

const createNetwork = (account) => {
  const { web3, from } = createWeb3(config.get(`network.provider`), account)

  return {
    from,
    networkType: config.get(`network.name`),
    web3,
    createContract: createContract.bind(null, { web3, address: from }),
    createMethod,
    send: send.bind(null, { web3, address: from })
  }
}

const getMethodName = (method) => method.methodName || 'unknown'

const getGasPrice = async (web3) => {
  const gasPrice = await fetchGasPrice('fast')
  return web3.utils.toWei(gasPrice.toString(), 'gwei')
}

const retries = 3

const TRANSACTION_HASH_IMPORTED = 'Transaction with the same hash was already imported'
const TRANSACTION_NONCE_TOO_LOW = 'Transaction nonce is too low'
const TRANSACTION_TIMEOUT = 'Timeout exceeded during the transaction confirmation process'
const TRANSACTION_REVERTED = 'Transaction has been reverted by the EVM'

const pickErrorHandler = (errorHandlers, error) => {
  const errorMessage = (error.message || error.error || error).toString()
  for (const errorType of Object.keys(errorHandlers)) {
    if (errorMessage.includes(errorType)) {
      return errorHandlers[errorType]
    }
  }

}
const send = async ({ web3, address }, method, options, handlers) => {
  const doSend = async (retry) => {
    let transactionHash
    const methodName = getMethodName(method)
    const nonce = account.nonce
    console.log(`[retry: ${retry}] sending method ${methodName} from ${from} with nonce ${nonce}. gas price: ${gasPrice}, gas limit: ${gas}, options: ${inspect(options)}`)
    const methodParams = { ...options, gasPrice, gas, nonce }
    const promise = method.send({ ...methodParams })
    promise.on('transactionHash', (hash) => {
      transactionHash = hash
      if (handlers && handlers.transactionHash) {
        handlers.transactionHash(hash)
      }
    })

    try {
      const receipt = await promise
      console.log(`method ${methodName} succeeded in tx ${receipt.transactionHash}`)
      return { receipt }
    } catch (error) {
      console.error(error)

      if (error.receipt) {
        return error
      }

      const updateNonce = async () => {
        console.log('updating the nonce')
        const nonce = await web3.eth.getTransactionCount(from)
        console.log(`new nonce is ${nonce}`)
        account.nonce = nonce
      }


      const errorHandlers = {
        [TRANSACTION_HASH_IMPORTED]: async () => {
          if (transactionHash) {
            const receipt = await web3.eth.getTransactionReceipt(transactionHash)
            return { receipt }
          }
        },
        [TRANSACTION_NONCE_TOO_LOW]: updateNonce,
        [TRANSACTION_TIMEOUT]: updateNonce,
        [TRANSACTION_REVERTED]: () => { throw error }
      }

      const errorHandler = pickErrorHandler(errorHandlers, error)
      if (errorHandler) {
        await errorHandler()
      } else {
        console.log('No error handler found, using the default one. (updating the nonce)')
        updateNonce()
        // throw error
      }
    }
  }

  const from = address
  const gas = options.gas || await method.estimateGas({ from })
  const gasPrice = await getGasPrice(web3)
  console.log({ address })
  const account = await Account.findOne({ address })
  for (let i = 0; i < retries; i++) {
    const response = await doSend(i) || {}
    const { receipt } = response
    if (receipt) {
      account.nonce++
      await Account.updateOne({ address }, { nonce: account.nonce })

      if (!receipt.status) {
        console.warn(`Transaction ${receipt.transactionHash} is reverted`)
      }
      return receipt
    }
  }
}

const getPrivateKey = (account) => {
  console.log(`Deriving pk for account ${account.address}, childIndex: ${account.childIndex}`)
  const derivedWallet = wallet.deriveChild(account.childIndex).getWallet()
  const derivedAddress = derivedWallet.getAddressString()
  if (account.address !== derivedAddress) {
    throw new Error(`Account address does not match with the private key. account address: ${account.address}, derived: ${derivedAddress}`)
  }
  return ethUtils.addHexPrefix(ethUtils.bufferToHex(derivedWallet.getPrivateKey()))
}


module.exports = {
  createWeb3,
  createContract,
  createMethod,
  send,
  createNetwork
}
