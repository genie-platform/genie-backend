const mongoose = require('mongoose')
const { Schema } = mongoose

const PrizeSchema = new Schema({
  amount: { type: String, required: [true, "can't be blank"] },
  game: { type: Schema.Types.ObjectId, ref: 'Game' },
  winnerId: { type: String, required: [true, "can't be blank"] },
  winnerAccountAddress: { type: String },
  redeemed: { type: Boolean, default: false }
}, { timestamps: true })

const Prize = mongoose.model('Prize', PrizeSchema)

module.exports = Prize
