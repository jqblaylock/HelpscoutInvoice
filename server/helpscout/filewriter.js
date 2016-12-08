/**
 * @function writeConversationsToFile
 * Parses an array of conversation objects and builds a blob
 * of text that is appended to the file specified.
 *
 * @param {Object} conversations - A Helpscout object containing an Array of conversation data.
 */
exports.writeConversationsToFile = function writeConversationsToFile(conversations){
    var fs = require('fs');
    var text = '';
    text = text + 'PAGE: ' + conversations.page + ' of ' + conversations.pages +
        '\n========================\n';
    conversations.items.forEach(function(t){
        //console.log(t);
        text = text +
            'Number:\t\t' + t.number.toString() + '\n';
            '\tStatus:\t\t' + t.status + '\n' +
            '\tCreated At:\t' + t.createdAt.toString() + '\n';
    });

    fs.appendFile('conversations.txt', text, function (err) {
        if (err) return console.log(err);
        console.log('File Written');
    });
}

/**
 * @function writeThreadsToFile
 * Parses a Helpscout thread object for a single conversation and
 * builds a readable blob of text that is appended to the given file.
 *
 * @param {Object} thread - Helpscout thread object for a specific conversation.
 */
exports.writeThreadToFile = function writeThreadToFile(thread){
    var fs = require('fs');
    var striptags = require('striptags');
    var text = '';

        text = text + 'Number:\t\t\t' + thread.number.toString() + '\n';

        thread.customFields.forEach(function(cf){
            if(cf.name === 'Client'){
                text = text + 'Client:\t\t\t' + cf.value + '\n';
            }
            if(cf.name === 'Billable Hours'){
                text = text + 'Billable Hours:\t' + cf.value + '\n';
            }
        })

        text = text +
            //'Status:\t\t\t' + thread.status + '\n' ;
            'Created At:\t\t' + thread.createdAt + '\n' +
            'Closed At:\t\t' + thread.closedAt + '\n' +
            'Closed By:\t\t' + thread.closedBy.firstName + ' ' + thread.closedBy.lastName + '\n' +
            '--------------------------------\n\n'
            'SUBJECT:  ' + thread.subject +
            'From: ' + thread.customer.firstName + ' ' + thread.customer.lastName + '\n\n';


            thread.threads.forEach(function(t){
                if(t.body !== null){
                    text = text +
                    t.createdAt + '  (' + t.createdBy.firstName + ' ' + t.createdBy.lastName + '):\n\n' +
                    striptags(t.body.replace(/<br>/g, '\n'))
                        .replace(/^\s+$/gm, '\n')
                        .replace(/\n{3,10}/g, '\n')
                        .replace(/Our Mission:\s+Enabling medical institutions to reach their full potential by matching the very best technology solutions to their business needs/g, '')
                        .replace(/This transmission may contain information that is privileged, confidential and\/or exempt from disclosure under applicable law\. If you are not the intended recipient, you are hereby notified that any disclosure, copying, distribution, or use of the information contained herein \(including any reliance thereon\) is STRICTLY PROHIBITED\. If you received this transmission in error, please immediately contact the sender and destroy the material in its entirety, whether in electronic or hard copy format\. Thank you\./g, '') +
                        '\n\n';
                }

            });
            text = text + '\n\n======================================================\n\n';


    fs.appendFile('threads.txt', text, function (err) {
        if (err) return console.log(err);
        //console.log('File Written');
    });
}