const router = require('express').Router()
const mongoose = require('mongoose')
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
  if (req.body.balance) {
    invest(accountAddress, toWei(String(req.body.balance)))
  } else {
    const balance = await getBalance(accountAddress)
    invest(accountAddress, balance)
  }
  res.json({ status: 'ok' })
})

module.exports = router
