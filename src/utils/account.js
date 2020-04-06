const config = require('config')
const { fromMasterSeed } = require('ethereumjs-wallet/hdkey')

const generateAccountAddress = (childIndex = 0) => {
  const mnemonic = config.get('secrets.accounts.mnemonic')
  const address = fromMasterSeed(mnemonic).deriveChild(childIndex).getWallet().getAddressString()
  return address
}

module.exports = {
  generateAccountAddress
}
