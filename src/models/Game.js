const mongoose = require('mongoose')
const { Schema } = mongoose

const GameSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  fund: { type: String, default: '0' },
  allocatedPrizes: { type: String, default: '0' }
})

GameSchema.index({ address: 1 }, { unique: true })

const Game = mongoose.model('Game', GameSchema)

module.exports = Game
