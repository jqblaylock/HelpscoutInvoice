var filewriter = require('./filewriter');
var mysql = require('mysql');
var config = require('../../server.config.json')

/**
 * Helpscout constructor function
 *
 */
var Helpscout = function() {

    this.poolOptions = {
    //properties...
        connectionLimit : config.connectionLimit,
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    }
    this.poolOpen = false;
}

Helpscout.prototype.reformatTicketBody = function(ticket) {
    var striptags = require('striptags');
    var text = '';
    ticket.forEach(function(thread){
        if(thread.body !== null && thread.body !== '' && thread.state !== 'hidden'){
            text = text +
            thread.createdAt + '  (' + thread.createdBy.firstName + ' ' + thread.createdBy.lastName + '):\n\n' +
            striptags(thread.body.replace(/<br>/g, '\n'))
                .replace(/^\s+$/gm, '\n')
                .replace(/\n{3,10}/g, '\n')
                .replace(/Our Mission:\s+Enabling medical institutions to reach their full potential by matching the very best technology solutions to their business needs/g, '')
                .replace(/This transmission may contain information that is privileged, confidential and\/or exempt from disclosure under applicable law\. If you are not the intended recipient, you are hereby notified that any disclosure, copying, distribution, or use of the information contained herein \(including any reliance thereon\) is STRICTLY PROHIBITED\. If you received this transmission in error, please immediately contact the sender and destroy the material in its entirety, whether in electronic or hard copy format\. Thank you\./g, '') +
                '\n\n';
        }
    });
    return text.replace(/'/g, "''");
};

Helpscout.prototype.mysqlOpen = function() {
    this.pool = mysql.createPool(this.poolOptions)
    this.poolOpen = true;
}

Helpscout.prototype.mysqlClose = function() {
    this.pool.end( err => {
        if(err) {
            console.log('pool.end error:', err);
        }else{
            console.log('Database connection closed.');
            this.poolOpen = false;
        }
    });
}

Helpscout.prototype.mysqlTestConnection = function(callback){
    if(!this.poolOpen){
        this.mysqlOpen();
    }
    this.pool.getConnection(function(err, connection){
        if(err){
            console.log(err);
            callback({
                message: err.message,
                error: err
            })
        }else{
            connection.release();
            callback('Connected');
        }

    });
}

Helpscout.prototype.mysqlQuery = function(query, callback) {
    if(!this.poolOpen){
        this.mysqlOpen();
    }
    this.pool.getConnection(function(err, connection){

        connection.query(query, function(err, rows){
            if(!!err){
                console.log('------------------\n' + query + '-------------------\n')
                console.log('QUERY ERROR:\n', 'Query: ', query, '\nError: ', err, '\n');
                callback(err);
            }else{
                connection.release();
                callback(rows);
            }
        });
    });
};

Helpscout.prototype.insertTicket = function(ticket, callback) {
    var query;
    var clientId = 'NA';  //Default to NA;
    var clientName;
    var threadBody;
    var billableHours = 0;
    ticket.customFields.forEach(function(cf){
        if(cf.name === 'Client'){
            clientId = cf.value;
        }else if(cf.name === 'Billable Hours'){
            billableHours = cf.value;
        }
    });
    if(!clientId){
        console.log('NO CLIENT SELECTED');
        clientId = 0;
    }
    if(!billableHours){
        billableHours = 0;
    }
    console.log(ticket.number)
    query = "call helpscoutInsert("+
        ticket.number+",'"+
        ticket.closedAt.replace(/T|Z/g, ' ')+"','"+
        //"1905-01-01', '" +
        ticket.closedBy.firstName+"','"+
        ticket.closedBy.lastName+"','"+
        this.clientMap(clientId)+"','"+
        ticket.subject.replace(/'/g, "''")+"','"+
        ticket.status+"','"+
        ticket.createdAt.replace(/T|Z/g, ' ')+"','"+
        ticket.modifiedAt.replace(/T|Z/g, ' ')+"','"+
        this.reformatTicketBody(ticket.threads)+"','"+
        billableHours+"')";
        this.mysqlQuery(query, function(rows) {
            callback(rows);
        });
};

Helpscout.prototype.insertTickets = function(callback) {
    var counter = this.threads.length;
    this.threads.forEach(function(ticket) {
        this.insertTicket(ticket, function(rows){
            //console.log(rows);
            counter--;
            if(counter === 0) {
                callback();
            }
        });
    }, this);
};

Helpscout.prototype.clientMap = function(clientId){
    var client = config.clientMap;
    if(client[clientId]){
        return client[clientId];
    }else{
        return 'OTHER';
    }
}

Helpscout.prototype.writeThreadsToFile = function(){
    this.threads.forEach(function(t){
        filewriter.writeThreadToFile(t);
    })
};

module.exports = Helpscout;



