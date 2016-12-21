var express = require('express');
var router = express.Router();
var config = require('../client.config.json');

router.get('/load', function(req, res, next){
    res.send(config);
})

module.exports = router;