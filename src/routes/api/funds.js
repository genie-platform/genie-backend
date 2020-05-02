const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('@routes/auth')
const config = require('config')

const Fund = mongoose.model('Fund')
const User = mongoose.model('User')

const { OAuth2Client } = require('google-auth-library')

const clientId = config.get('api.auth.google.clientId')
const client = new OAuth2Client(clientId)

/**
 * @api {get} /funds/:fundId Retrieve fund
 * @apiName GetFund
 * @apiGroup Fund
 * @apiDescription Retrieves fund object
 *
* @apiParam {String} fundId fund's id
 *
**/
router.get('/:fundId', async (req, res, next) => {
  const { fundId } = req.params
  const fund = await Fund.findById(fundId)
  return res.json({ data: fund })
})

/**
 * @api {post} /funds/ Create new fund
 * @apiName CreateFund
 * @apiGroup Fund
 * @apiDescription Creates new fund with a funding, returs the fund
 *
 * @apiParam {String} name fund's name
 *
 *  @apiParamExample {json} Request-Example:
 *  {
 *      "name": "My fund",
 *  }
 *
**/
router.post('/', auth.required, async (req, res, next) => {
  const { name, description, lockValue, icon, coverImage, winnerDescription, rewardDuration, txHash, token } = req.body

  // get owner user object from db
  // const { tokenId } = req.headers.authorization.split(" ")[1]

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId
  })

  const { email } = ticket.getPayload()

  let user = await User.findOne({ email: email })

  // save fund
  const fund = await new Fund({ name, description, lockValue, icon, coverImage, winnerDescription, rewardDuration, txHash, fundOwner: user._id }).save()

  return res.json({ data: { fund } })
})

router.post('/:fundId', auth.required, async (req, res, next) => {
  // update the fund's contract address
})

module.exports = router