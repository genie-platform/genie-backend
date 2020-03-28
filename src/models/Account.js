const mongoose = require('mongoose')
const { Schema } = mongoose

const AccountSchema = new Schema({
  address: { type: String, required: [true, "can't be blank"] },
  childIndex: { type: Number, required: [true, "can't be blank"] },
  nonce: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockingTime: { type: Date }
}, { timestamps: true })

AccountSchema.index({ address: 1 }, { unique: true })

const Account = mongoose.model('Account', AccountSchema)

module.exports = Account
