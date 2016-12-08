var express = require('express');
var router = express.Router();
var run = require('../server/helpscout/run');


router.post('/test', function(req, res, next){
   run(req.body.start, req.body.end, function(){
       res.send('Run Complete');
   });
})

module.exports = router;