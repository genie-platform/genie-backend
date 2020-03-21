const Web3 = require('web3')
const ethUtils = require('ethereumjs-util')
const ethers = require('ethers')
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

const TRANSACTION_HASH_IMPORTED = 'Error: Returned error: Transaction with the same hash was already imported.'
const TRANSACTION_NONCE_TOO_LOW = 'Error: Returned error: Transaction nonce is too low. Try incrementing the nonce.'
const TRANSACTION_TIMEOUT = 'Error: Timeout exceeded during the transaction confirmation process. Be aware the transaction could still get confirmed!'

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

      const updateNonce = async () => {
        console.log('updating the nonce')
        const nonce = await web3.eth.getTransactionCount(from)
        console.log(`new nonce is ${nonce}`)
        account.nonce = nonce
      }

      if (error.receipt) {
        await updateNonce()
        account.save()
        throw error
      }

      const errorHandlers = {
        [TRANSACTION_HASH_IMPORTED]: async () => {
          if (transactionHash) {
            const receipt = await web3.eth.getTransactionReceipt(transactionHash)
            return { receipt }
          }
        },
        [TRANSACTION_NONCE_TOO_LOW]: updateNonce,
        [TRANSACTION_TIMEOUT]: updateNonce
      }

      const errorMessage = doSend.message || error.error || error
      if (errorHandlers.hasOwnProperty(errorMessage)) {
        return errorHandlers[errorMessage]()
      } else {
        console.log('No error handler found, using the default one.')
        throw error
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

const toBufferStripPrefix = (str) => Buffer.from(ethUtils.stripHexPrefix(str), 'hex')

const generateSignature = async (method, methodArguments, privateKey) => {
  const msg = await method(...methodArguments).call()
  const vrs = ethUtils.ecsign(toBufferStripPrefix(msg), toBufferStripPrefix(privateKey))
  return ethUtils.toRpcSig(vrs.v, vrs.r, vrs.s)
}

const sha3 = (input) => {
  if (ethers.utils.isHexString(input)) {
    return ethers.utils.keccak256(input)
  }
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input))
}

const signMultiSigHash = (walletAddr, destinationAddr, value, data, nonce) => {
  let input = '0x' + [
    '0x19',
    '0x00',
    walletAddr,
    destinationAddr,
    ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32),
    data,
    ethers.utils.hexZeroPad(ethers.utils.hexlify(nonce), 32)
  ].map(hex => hex.slice(2)).join('')

  return sha3(input)
}

const signMultiSig = async (web3, account, multiSigContract, contractAddress, data) => {
  // Get the nonce
  const nonce = (await multiSigContract.methods.nonce().call()).toNumber()

  // Get the sign Hash
  let hash = signMultiSigHash(multiSigContract.address, contractAddress, 0, data, nonce)

  // Get the off chain signature
  const signHashBuffer = Buffer.from(hash.slice(2), 'hex')
  const signature = web3.eth.accounts.sign(signHashBuffer, getPrivateKey(account))

  return signature.signature
}

const generateSalt = () => {
  return ethers.utils.bigNumberify(ethers.utils.randomBytes(32)).toHexString()
}

module.exports = {
  createWeb3,
  generateSignature,
  signMultiSig,
  createContract,
  createMethod,
  send,
  createNetwork,
  generateSalt
}
