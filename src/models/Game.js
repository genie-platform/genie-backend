const mongoose = require('mongoose')
const { Schema } = mongoose

const GameSchema = new Schema({
  name: { type: String, required: [true, "can't be blank"] },
  accountAddress: { type: String, required: [true, "can't be blank"] },
  fund: { type: String, default: '0' }
}, { timestamps: true })

const Game = mongoose.model('Game', GameSchema)

module.exports = Game
