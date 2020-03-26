const router = require('express').Router()
const mongoose = require('mongoose')
const { fromWei } = require('web3-utils')
const Prize = mongoose.model('Prize')
const Game = mongoose.model('Game')
const auth = require('@routes/auth')
const { getNextPrize, redeemPrize } = require('@services/funding')

router.post('/', auth.required, async (req, res) => {
  const { accountAddress } = req.user
  const { winnerId } = req.body
  const nextPrize = await getNextPrize(accountAddress)
  const game = await Game.findOne({ accountAddress })
  const prize = await new Prize({
    amount: nextPrize,
    game,
    winnerId
  }).save()

  res.json({
    data: prize
  })
})

router.post('/claim', auth.required, async (req, res) => {
  const { accountAddress } = req.user
  const { winnerId, winnerAccountAddress } = req.body
  const prize = await Prize.findOne({ winnerId })
  if (prize.redeemed) {
    return res.send({ error: 'Prize already have been redeemed' }).status(404)
  }
  prize.winnerAccountAddress = winnerAccountAddress
  redeemPrize(accountAddress, prize)

  res.json({
    data: prize
  })
})

router.get('/nextPrize', auth.required, async (req, res, next) => {
  const { accountAddress } = req.user
  const nextPrize = fromWei(await getNextPrize(accountAddress))
  return res.json({ data: nextPrize })
})

module.exports = router
