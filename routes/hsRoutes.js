var express = require('express');
var router = express.Router();
var helpscout = require('../server/helpscout/helpscout');

var hs = new helpscout();

router.post('/file', function(req, res, next){
    hs.threads = req.body;
    hs.writeThreadsToFile();
    res.send('Tickets Dropped to File');
})

module.exports = router;