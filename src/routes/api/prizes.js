const router = require('express').Router()
const mongoose = require('mongoose')
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

router.post('/redeem', auth.required, async (req, res) => {
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

module.exports = router
