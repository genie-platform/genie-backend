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
const lockAccount = async (query) => {
  return Account.findOneAndUpdate({ isLocked: false, ...query }, { isLocked: true, lockingTime: new Date() })
}

const unlockAccount = async (address) =>
  Account.findOneAndUpdate({ address }, { isLocked: false, lockingTime: null })

const withAccount = (func, getAccount) => async (...params) => {
  const account = getAccount ? await getAccount(...params) : await lockAccount()
  if (!account) {
    throw new Error('no unlocked accounts available')
  }
  try {
    await func(account, ...params)
    await unlockAccount(account.address)
  } catch (e) {
    await unlockAccount(account.address)
    throw e
  }
}

module.exports = {
  createAccount,
  lockAccount,
  unlockAccount,
  withAccount
}
