const router = require('express').Router()
const auth = require('@routes/auth')

router.post('/:', auth.required, async (req, res, next) => {

})

module.exports = router
