const router = require('express').Router()
const auth = require('@routes/auth')
const { sendDaiFaucet, sendEthFaucet } = require('@services/faucets/faucets')

/**
* @api {post} /faucets send eth and dai to user
* @apiName SendAll
* @apiGroup Faucets
* @apiDescription Sends dai and eth to user if he doesn't have enough to join the pool
*
**/
router.post('/', auth.required, async (req, res, next) => {
  const { poolAddress, userAddress } = req.body

  const ethReceipt = await sendEthFaucet(userAddress)
  const daiReceipt = await sendDaiFaucet(poolAddress, userAddress)

  return res.json({ data: { ethReceipt, daiReceipt } })
})

/**
* @api {post} /faucets/dai send dai to user
* @apiName SendDai
* @apiGroup Faucets
* @apiDescription Sends dai to user if he doesn't have enough to join the pool
*
**/
router.post('/dai', auth.required, async (req, res, next) => {
  const { poolAddress, userAddress } = req.body

  const receipt = await sendDaiFaucet(poolAddress, userAddress)
  return res.json({ data: { receipt } })
})

/**
* @api {post} /faucets/eth send eth to user
* @apiName SendEth
* @apiGroup Faucets
* @apiDescription Sends eth to user if he doesn't have enough to join the pool
*
**/
router.post('/eth', auth.required, async (req, res, next) => {
  const { userAddress } = req.body

  const receipt = await sendEthFaucet(userAddress)
  return res.json({ data: { receipt } })
})

module.exports = router
