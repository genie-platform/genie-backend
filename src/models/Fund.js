const mongoose = require('mongoose')
const { Schema } = mongoose

const FundSchema = new Schema({
  fundOwner: { type: mongoose.ObjectId, required: [true, "can't be blank"] },
  contractAddress: String,
  txHash: { type: String, required: [true, "can't be blank"] },
  name: { type: String, required: [true, "can't be blank"] },
  description: { type: String, required: [true, "can't be blank"] },
  lockValue: { type: Number, required: [true, "can't be blank"] },
  icon: { type: String, required: [true, "can't be blank"] },
  coverImage: { type: String, required: [true, "can't be blank"] },
  winnerDescription: String,
  rewardDuration: { type: Number, default: null },
}, { timestamps: true })

const Fund = mongoose.model('Fund', FundSchema)

module.exports = Fund
