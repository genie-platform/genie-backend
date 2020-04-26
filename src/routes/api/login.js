const router = require('express').Router()
const jwt = require('jsonwebtoken')
const config = require('config')
const mongoose = require('mongoose')
const { OAuth2Client } = require('google-auth-library')
require('../../models')

const clientId = config.get('api.auth.google.clientId')
const secret = config.get('api.secret')
const secretOptions = config.get('api.secretOptions')

const User = mongoose.model('User')
const client = new OAuth2Client(clientId)

router.post('/google', async (req, res) => {
  const { tokenId } = req.body
  console.log({ tokenId })

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: clientId
  })

  const { email, name } = ticket.getPayload()

  let user = await User.findOne({ email: email })

  if (!user) {
    user = await User({
      email,
      name,
      provider: 'google'
    }).save()
  }

  const token = jwt.sign({ email, id: user._id }, secret, secretOptions)
  res.json({ token })
})

module.exports = router
