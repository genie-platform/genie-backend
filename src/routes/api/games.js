const router = require('express').Router()
const mongoose = require('mongoose')
const Game = mongoose.model('Game')
const { createAccount } = require('@services/account')
const { generateToken } = require('@utils/jwt')

/**
 * @api {get} /games/:gameId Retrieve game
 * @apiName GetGame
 * @apiGroup Game
 * @apiDescription Retrieves game object
 *
* @apiParam {String} gameId Game's id
 *
**/
router.get('/:gameId', async (req, res, next) => {
  const { gameId } = req.params
  const game = await Game.findById(gameId)
  return res.json({ data: game })
})

/**
 * @api {post} /games/ Create new game
 * @apiName CreateGame
 * @apiGroup Game
 * @apiDescription Creates new game with a funding
 *
 * @apiParam {String} name Game's name
 *
 *  @apiParamExample {json} Request-Example:
 *  {
 *      "name": "My game",
 *  }
 *
**/
router.post('/', async (req, res, next) => {
  const { name } = req.body
  const account = await createAccount()
  const game = await new Game({ name, accountAddress: account.address }).save()
  return res.json({ response : "Game Created.", data: game  })
})

module.exports = router
