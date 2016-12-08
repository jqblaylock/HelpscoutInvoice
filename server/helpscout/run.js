var Helpscout = require('./helpscout');

var Run = function(startDate, endDate, callback){
    var helpscout = new Helpscout();
    console.log('startDate: ', startDate);
    console.log('endDate: ', endDate);
    helpscout.getConversations(startDate, endDate, function() {
        helpscout.getThreads(function() {
            helpscout.writeThreadsToFile();
            callback();
            //helpscout.insertTickets(function() {
            //    helpscout.mysqlClose();
            //});
        });
    });
}

module.exports = Run;

