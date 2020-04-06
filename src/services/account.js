const mongoose = require('./mongoose')
const Account = mongoose.model('Account')
const { generateAccountAddress } = require('@utils/account')

const createAccount = async () => {
  const lastAccount = await Account.findOne().sort({ childIndex: -1 })
  console.log({ lastAccount })
  const lastChildIndex = (lastAccount && lastAccount.childIndex) || 0
  const childIndex = lastChildIndex + 1
  const address = generateAccountAddress(childIndex)
  const account = await new Account({
    childIndex,
    address
  }).save()
  return account
}

module.exports = {
  createAccount
}
