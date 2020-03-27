const router = require('express').Router()
const mongoose = require('mongoose')
const Game = mongoose.model('Game')

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

module.exports = router
