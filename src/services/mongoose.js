const config = require('config')

const mongoose = require('mongoose')

mongoose.set('debug', config.get('mongo.debug'))
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

mongoose
  .connect(config.get('mongo.uri'), config.get('mongo.options'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

require('../models')

module.exports = mongoose
