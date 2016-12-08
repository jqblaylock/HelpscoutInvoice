describe('Helpscout API: ', function() {
    var Helpscout = require('../app/helpscout');

    xdescribe('Conversations - ', function() {
        var helpscout;

        beforeEach(function() {
            helpscout = new Helpscout();
        });

        it('should be able to query conversations', function(done) {
            helpscout.query('/v1/mailboxes.json', function(res){
                expect(res.response.statusCode).toEqual(200);
                 done();
            });
        });

        it('should be able to get all closed conversations for a date range', function(done) {
            var now = new Date();
            var startDate = new Date(now.getFullYear(), now.getMonth());
            var endDate = new Date(now.getFullYear(), now.getMonth()+1);
            helpscout.getConversations(startDate, endDate, function() {
                var actual = Object.keys(helpscout.conversations[0]).sort();
                var expected = [
                    'id', 'number', 'mailboxId', 'subject', 'status', 'threadCount', 'preview', 'customerName', 'customerEmail', 'modifiedAt'
                ].sort();
                expect(actual).toEqual(expected);
                done();
            });
        });

    });

    describe('Threads - ', function(){
        var originalTimeout;
        var helpscout;

        beforeAll(function(done){
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

            helpscout = new Helpscout();

            var now = new Date();
            var startDate = new Date(now.getFullYear(), now.getMonth());
            var endDate = new Date(now.getFullYear(), now.getMonth()+1);

            helpscout.getConversations(startDate, endDate, function() {
                done();
            });
        });

        afterAll(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        it('should be able to get all threads for a conversation', function(done){
            var conversationId = helpscout.conversations[0].id;
            helpscout.getThread(conversationId, function(thread) {
                var actual = Object.keys(thread).sort();
                var expected = [
                    'bcc','cc','closedAt','closedBy','createdAt','createdBy','customFields','customer','folderId','id','isDraft','mailbox','modifiedAt',
                    'number','owner','preview','source','status','subject','tags','threadCount','threads','type'
                ].sort();
                expect(actual).toEqual(expected);
                done();
            });
        });

        it('should be able to compile the thread data for all conversations without tripping API limit of 200 requests per minute', function(done) {
            var limit = 250;
            if(helpscout.conversations.length >= limit){
                helpscout.conversations = helpscout.conversations.slice(0,limit);
            }else{
                while(helpscout.conversations.length < limit){
                    helpscout.conversations.push(helpscout.conversations[0])
                }
            }
            helpscout.getThreads(function() {
                expect(helpscout.threads).toEqual(jasmine.any(Array));
                var actual = Object.keys(helpscout.threads[0]).sort();
                var expected = [
                    'bcc','cc','closedAt','closedBy','createdAt','createdBy','customFields','customer','folderId','id','isDraft','mailbox','modifiedAt',
                    'number','owner','preview','source','status','subject','tags','threadCount','threads','type'
                ].sort();
                expect(actual).toEqual(expected);
                expect(helpscout.threads.length).toEqual(limit);
                done();
            });
        });

        xit('should be able to reformat the body of a thread', function() {
            var body = '';
            console.log(helpscout.threads);
            helpscout.threads.forEach(function(t) {
                body = body + helpscout.reformatTicketBody(t);
            });
            //console.log(body);
            expect(body).not.toMatch("<p>");
            expect(body).not.toMatch("<table>");
            expect(body).not.toMatch(/Our Mission:\s+Enabling medical institutions to reach their full potential by matching the very best technology solutions to their business needs/);
            expect(body).not.toMatch(/This transmission may contain information that is privileged, confidential and\/or exempt from disclosure under applicable law\. If you are not the intended recipient, you are hereby notified that any disclosure, copying, distribution, or use of the information contained herein \(including any reliance thereon\) is STRICTLY PROHIBITED\. If you received this transmission in error, please immediately contact the sender and destroy the material in its entirety, whether in electronic or hard copy format\. Thank you\./);
        });

        describe('MySQL - ', function(){

/*            beforeEach(function(done) {
                done();
            });*/

            it('should be able to query MySQL', function(done) {
                var query = 'SELECT id FROM ost_billing LIMIT 10'
                helpscout.mysqlQuery(query, function(rows){
                    expect(rows.errno).toBeUndefined();
                    done();
                });
            });

            it('should be able to insert tickets into the database', function(done) {
                var ticket = helpscout.threads[0];
                helpscout.insertTicket(ticket, function(rows){
                    console.log(rows.affectedRows);
                    expect(rows.affectedRows).toEqual(1);
                    done();
                });
            });

            it('should be able to translate the thread`s clientId to the billing name', function(){
                var clientId = '5718';
                var clientName = helpscout.clientMap(clientId);
                expect(clientName).toEqual('POPLAR HEALTHCARE MGMT');
            });

        });

    });


});