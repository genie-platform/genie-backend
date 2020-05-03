const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('@routes/auth')
const config = require('config')

const Pool = mongoose.model('Pool')
const User = mongoose.model('User')

const { OAuth2Client } = require('google-auth-library')

const clientId = config.get('api.auth.google.clientId')
const client = new OAuth2Client(clientId)

/**
 * @api {get} /pools/:poolId Retrieve pool
 * @apiName GetPool
 * @apiGroup Pool
 * @apiDescription Retrieves pool object
 *
* @apiParam {String} poolId pool's id
 *
**/
router.get('/:poolId', async (req, res, next) => {
  const { poolId } = req.params
  const pool = await Pool.findById(poolId)
  return res.json({ data: pool })
})

/**
 * @api {post} /pools/ Create new pool
 * @apiName CreatePool
 * @apiGroup Pool
 * @apiDescription Creates new pool with a pooling, returs the pool
 *
 * @apiParam {String} name pool's name
 *
 *  @apiParamExample {json} Request-Example:
 *  {
 *      "name": "My pool",
 *  }
 *
**/
router.post('/', auth.required, async (req, res, next) => {
  const { name, description, lockValue, icon, coverImage, winnerDescription, rewardDuration, txHash } = req.body

  // get owner user object from db
  let user = await User.findOne({ email: req.user.email })

  // save pool
  const pool = await new Pool({ name, description, lockValue, icon, coverImage, winnerDescription, rewardDuration, txHash, poolOwner: user._id }).save()

  return res.json({ data: { pool } })
})

router.post('/:poolId', auth.required, async (req, res, next) => {
  // update the pool's contract address
})

module.exports = router