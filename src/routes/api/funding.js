const router = require('express').Router()
const BigNumber = require('bignumber.js')
const mongoose = require('mongoose')
const Account = mongoose.model('Account')
const Game = mongoose.model('Game')

const { getBalance, getInvestedBalance, invest } = require('@services/funding')
const auth = require('@routes/auth')
const { fromWei, toWei } = require('web3-utils')

router.get('/', auth.required, async (req, res, next) => {
  const { accountAddress } = req.user
  const account = await Account.findOne({ address: accountAddress })
  return res.json({ data: account })
})

router.get('/balance', auth.required, async (req, res, next) => {
  const { accountAddress } = req.user
  const available = fromWei(await getBalance(accountAddress))
  const { fund } = await Game.findOne({ accountAddress })
  const investedBalance = await getInvestedBalance(accountAddress)
  const nextPrize = fromWei(new BigNumber(investedBalance).minus(fund).toString())
  return res.json({ data: { balance: { available, fund: fromWei(fund), nextPrize } } })
})

router.post('/invest', auth.required, async (req, res, next) => {
  const { accountAddress } = req.user
  const account = await Account.findOne({ address: accountAddress })
  console.log({ accountAddress })
  if (req.body.balance) {
    invest(account, toWei(String(req.body.balance)))
  } else {
    const balance = await getBalance(accountAddress)
    invest(account, balance)
  }
  res.json({ status: 'ok' })
})

module.exports = router
