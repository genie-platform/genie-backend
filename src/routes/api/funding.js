const router = require('express').Router()
const mongoose = require('mongoose')
const BigNumber = require('bignumber.js')
const Account = mongoose.model('Account')
const Game = mongoose.model('Game')
const auth = require('@routes/auth')
const { fromWei, toWei } = require('web3-utils')
const { getBalance, invest, getNextPrize } = require('@services/funding')

router.get('/', auth.required, async (req, res, next) => {
  const { accountAddress } = req.user
  const account = await Account.findOne({ address: accountAddress })
  return res.json({ data: account })
})

router.get('/balance', auth.required, async (req, res, next) => {
  const { accountAddress } = req.user
  const available = fromWei(await getBalance(accountAddress))
  const { fund } = await Game.findOne({ accountAddress })
  const nextPrize = fromWei(await getNextPrize(accountAddress))
  return res.json({ data: { balance: { available, fund: fromWei(fund), nextPrize } } })
})

router.post('/invest', auth.required, async (req, res) => {
  const { accountAddress } = req.user
  const accountBalance = await getBalance(accountAddress)
  const balance = req.body.balance
    ? toWei(String(req.body.balance))
    : accountBalance

  if (new BigNumber(balance).isGreaterThan(accountBalance)) {
    return res.status(400).send({ error: 'Investing more than account balance, please topup' })
  }
  if (balance === '0') {
    return res.status(400).send({ error: 'Cannot invest 0, please topup' })
  }
  invest(accountAddress, balance)

  res.send({ status: 'ok' })
})

module.exports = router
