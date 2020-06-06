const router = require('express').Router()
const auth = require('@routes/auth')
const { sendDaiFaucet } = require('@services/faucets/faucets')


/**
* @api {post} /faucets/dai send dai to user
* @apiName SendDai
* @apiGroup Faucets
* @apiDescription Sends dai to user if he doesn't have enough to join the pool
*
**/
router.post('/dai', auth.required, async (req, res, next) => {
  const { poolAddress, userAddress } = req.body

  try {
    const receipt = await sendDaiFaucet(poolAddress, userAddress)
    return res.json({ data: { receipt } })
  } catch (error) {
    return res.json({ data: {} })
  }
})

module.exports = router