const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('@routes/auth')

const Pool = mongoose.model('Pool')
const User = mongoose.model('User')

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
  let user = await User.findOne({ _id: req.user.id })

  // save pool
  const pool = await new Pool({ name, description, lockValue, icon, coverImage, winnerDescription, rewardDuration, txHash, poolOwner: user._id, contractAddress: null }).save()

  return res.json({ data: { pool } })
})

/**
 * @api {post} /pools/:poolId Update pool with id "poolId"
 * @apiName Update pool data
 * @apiGroup Pool
 * @apiDescription Updates pool data, returns the updated pool
 *
 * @apiParam {String} poolId pool's id
 *
 *
**/
router.put('/:poolId', auth.required, async (req, res, next) => {
  // update the pool's contract address
  const poolId = req.params.poolId
  const contractAddress = req.body.contractAddress
  const poolDetails = req.body.poolDetails

  const pool = await Pool.findOneAndUpdate(poolId, { ...poolDetails }, { new: true })

  return res.json({ data: { pool } })
})

module.exports = router