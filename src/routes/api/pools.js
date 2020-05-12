const router = require('express').Router()
const mongoose = require('mongoose')
const auth = require('@routes/auth')
const paginate = require('express-paginate')

const Pool = mongoose.model('Pool')
const User = mongoose.model('User')

/**
 * @api {get} /pools/owner:poolOwner Retrieve all pools for a OWNER
 * @apiName GetPoolForOwner
 * @apiGroup Pool
 * @apiDescription Retrieves all pool objects for a owner addeess
 *
 * @apiParam {String} poolOwner Address  pool owner
 *
**/
router.get('/owner/:poolOwner', async (req, res, next) => {
  console.log('owner')
  const { poolOwner } = req.params
  const pool = await Pool.find({ poolOwner })
  return res.json({ data: pool })
})

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
  console.log('id')

  const { poolId } = req.params
  const pool = await Pool.findById(poolId)
  return res.json({ data: pool })
})

/**
 * @api {get} /pools/contract/:contractAddress Retrieve by address
 * @apiName GetPoolByAddress
 * @apiGroup Pool
 * @apiDescription Fecthes pool object by pool's contract address
 *
 * @apiParam {String} contractAddress pool's contract address
 *
**/
router.get('/contract/:contractAddress', async (req, res, next) => {
  const { contractAddress } = req.params
  const pool = await Pool.findOne({ contractAddress })
  return res.json({ data: pool })
})

/**
 * @api {get} /pools Retrieve all pools
 * @apiName GetAllPool
 * @apiGroup Pool
 * @apiDescription Retrieves all pool objects
 *
 * @apiParam None
 *
**/
router.get('/', async (req, res, next) => {
  const [ results, itemCount ] = await Promise.all([
    Pool.find({}).limit(req.query.limit).skip(req.skip).lean().exec(),
    Pool.count({})
  ])

  const pageCount = Math.ceil(itemCount / req.query.limit)

  res.json({
    object: 'list',
    has_more: paginate.hasNextPages(req)(pageCount),
    data: results
  })
  // Pool.find({}, {}, query, (err, data) => {
  //   // Mongo command to fetch all data from collection.
  //   if (err) {
  //     response = { 'error': true, 'message': 'Error fetching Pool data' }
  //       } else {
  //     response = { 'error': false, 'message': data }
  //       }
  //   res.json(response)
  //   })
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
