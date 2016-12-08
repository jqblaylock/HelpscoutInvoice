var filewriter = require('./filewriter');
var mysql = require('mysql');

/**
 * Helpscout constructor function
 *
 */
var Helpscout = function() {
    this.hostname = 'api.helpscout.net';
    this.apiKey = '838f6de2a34d17e1c430486b732e25a74a55bad5';
    this.apiPass = 'X';
    this.mailboxId = '79656';

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


Helpscout.prototype.query = function(query, callback) {
    var https = require('https');

    var options = {
        hostname: this.hostname,
        path: query,
        auth: this.apiKey + ':' + this.apiPass
    };

    var req = https.request(options, (res) => {
        if(res.statusCode != '200'){
            var wait = parseInt(res.headers["retry-after"]) + 3;
            console.log('Retry After: ', wait.toString());
        }else{
            this.getQueryBody(res, function(body) {
                callback({response: res, body: body});
            });
        }
    });

    req.end();

    req.on('error', (e) => {
      console.error('helpscout.query req ERROR:  ', e);
    });
};

Helpscout.prototype.getQueryBody = function(res, callback) {
    var body = [];
    res.on('data', (d) => {
        body.push(d);
    });
    res.on('end', (err) => {
        body = Buffer.concat(body).toString();
        body = JSON.parse(body)
        callback(body);
    });
};

Helpscout.prototype.getConversations = function(startDate, endDate, callback) {
    var pages = 1;
    var data = [];
    var runQuery =  (page) => {
        if(page <= pages){

            var search = '/v1/search/conversations.json?query=(status:"closed"%20AND%20mailboxid:79656%20AND%20' +
                         'modifiedAt:['+startDate+'%20TO%20'+endDate + '])&page='+page;

            this.query(search, function(res) {
                pages = res.body.pages;
                data.push(res.body.items);

/*                var countStart = 50*page-49;
                var countEnd = 50*page;
                if(countEnd > res.body.count) {
                    countEnd = res.body.count
                }
                console.log('page ', page, ' of ', res.body.pages, '. Ticket ', countStart, '-', countEnd, ' of', res.body.count, '...');*/

                page++;
                runQuery(page);
            });
        }else{
            this.conversations = [].concat.apply([], data);
            callback();
        }
    }

    runQuery(1);
};

Helpscout.prototype.getThread = function(conversationId, callback) {
    var search = '/v1/conversations/'+conversationId+'.json';
    this.query(search, function(res) {
        callback(res.body.item);
    });
};

Helpscout.prototype.getThreads = function(callback) {
    var allThreads = [];
    var runGetThread = (i) => {
        if(i < this.conversations.length){
            var item = this.conversations[i];
            this.getThread(item.id, function(thread){
                allThreads.push(thread);
                runGetThread(i+1);
            });
        }else{
            this.threads = allThreads;
            callback();
        }
    }
    runGetThread(0);
};

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



