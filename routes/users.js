const express = require("express");
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', (req, res) => {
    res.send(req.body)
})

module.exports = router;