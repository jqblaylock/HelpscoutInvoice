var express = require('express');
var router = express.Router();
var helpscout = require('../server/helpscout/helpscout');

var hs = new helpscout();

//Write threads to File.
router.post('/file', function(req, res, next){
    hs.threads = req.body;
    hs.writeThreadsToFile();
    res.send('Tickets Dropped to File');
})

//Write threads to MySQL.
router.post('/mysql', function(req, res, next){
    hs.threads = req.body;
    hs.insertTickets(function(){
        res.send('Tickets written to database.');
        hs.mysqlClose();
    });

})

//Check DB Connection
router.get('/dbConn', function(req, res, next){
    hs.mysqlTestConnection(function(cb){
        res.send(cb);
        //hs.mysqlClose();
    });
})

module.exports = router;