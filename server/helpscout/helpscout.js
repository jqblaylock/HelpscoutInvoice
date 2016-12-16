var filewriter = require('./filewriter');
var mysql = require('mysql');

/**
 * Helpscout constructor function
 *
 */
var Helpscout = function() {

    this.pool = mysql.createPool({
    //properties...
        //Local Host
        connectionLimit : 10,
        host: 'localhost',
        user: 'root',
        password: 'PMT@mysql1',
        database: 'helpscoutapi'

        //Blue Host
/*        connectionLimit : 5,
        host: 'box867.bluehost.com',
        user: 'temporc7_tech',
        password: '1YeVF56r9aUg0QCLGdmF',
        database: 'temporc7_tech'*/
    });
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

Helpscout.prototype.mysqlQuery = function(query, callback) {
    this.pool.getConnection(function(err, connection){

        connection.query(query, function(err, rows){
            if(!!err){
                console.log('QUERY ERROR:\n', 'Query: ', query, '\nError: ', err, '\n');
                callback(err);
            }else{
                callback(rows);
            }
        });
        connection.release();
        //console.log('Connection Released');
    });
};

Helpscout.prototype.mysqlClose = function() {
    console.log('End Pool');
    this.pool.end(function(err) {
        if(err) {
            console.log('pool.end error:', err);
        }else{
            console.log('pool.end successful');
        }
    });
}

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
        //console.log('NO HOURS INPUT: ', ticket.number);
        billableHours = 0;
    }
    query = "call helpscoutInsert("+
        ticket.number+",'"+
        //ticket.closedAt.replace(/T|Z/g, ' ')+"','"+
        "1905-01-01', '" +
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
            console.log(rows);
            counter--;
            if(counter === 0) {
                callback();
            }
        });
    }, this);
};

Helpscout.prototype.clientMap = function(clientId){
    var client = {
        '5718': 'POPLAR HEALTHCARE MGMT',
        '5719': 'PUGET SOUND INSTITUTE OF PATHOLOGY',
        '5720': 'BAKO PATHOLOGY',
        '5721': 'PATHOLOGY ASSOCIATES-FRESNO',
        '5727': 'CELLNETIX',
        '5723': 'NYU',
        '7973': 'NYU DERM',
        '7974': 'NYU RESEARCH',
        '5724': 'CENTRAL OREGON PATHOLOGY CONSULTANTS',
        '5725': 'BIO-PATH MEDICAL GROUP',
        '5722': 'ABCODIA',
        '5726': 'INCYTE',
        '5728': 'OHSU',
        '5729': 'DAHL-CHASE DIAGNOSTIC SERVICES',
        '7975': 'STANFORD HOSPITAL & CLINICS',
        '7976': 'UCLA DEPARTMENT OF PATHOLOGY',
        '7977': 'UW DEPARTMENT OF PATHOLOGY'
    }
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



