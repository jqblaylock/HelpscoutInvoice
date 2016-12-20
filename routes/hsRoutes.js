var express = require('express');
var router = express.Router();
var helpscout = require('../server/helpscout/helpscout');

var hs = new helpscout();

router.post('/file', function(req, res, next){
    hs.threads = req.body;
    hs.writeThreadsToFile();
    res.send('Tickets Dropped to File');
})

router.get('/dbConn', function(req, res, next){
    hs.mysqlTestConnection(function(cb){
        if(cb === 'Connected'){
            res.send(cb);
        }else{
            res.send(cb.code + ':  Error connecting to the os_ticket database.  Verify the source IP is whitelisted on BlueHost.');
        }
        //hs.mysqlClose();
    });
})

module.exports = router;