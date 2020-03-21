const jwt = require('jsonwebtoken')
const config = require('config')

const generateToken = (accountAddress) => {
  const secret = config.get('api.secret')
  const token = jwt.sign({ accountAddress }, secret, config.get('api.secretOptions'))

  return token
}

module.exports = {
  generateToken
}
