module.exports = {
  api: {
    allowCors: true,
    secret: 'secret',
    secretOptions: {
      expiresIn: '30d'
    },
    port: 3000,
    auth: {
      google: {
        clientId:
          '1045886499834-t0vrjhlq8ep534njprdp8k80jl4iqdra.apps.googleusercontent.com'
      }
    }
  },
  mongo: {
    debug: true,
    uri: 'mongodb://localhost/genie',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  mail: {
    sendgrid: {
      templates: {}
    }
  },
  network: {
    name: 'kovan',
    addresses: {
      DaiToken: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      CDaiToken: '0xe7bc397dbd069fc7d0109c0636d06888bb50668c',
      CompoundDai: '0xe7bc397DBd069fC7d0109C0636d06888bb50668c'
    },
    gasStation: 'https://ethgasstation.info/json/ethgasAPI.json',
    contract: {
      options: {
        transactionConfirmationBlocks: 2
      }
    }
  }
}
