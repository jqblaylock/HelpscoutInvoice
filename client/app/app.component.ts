import { Component, OnInit } from '@angular/core';

import { HelpscoutService } from './helpscout.service';
import { MysqlService } from './mysql.service';
import { Observable } from 'rxjs/Rx';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    date = new Date();
    startDate: string = this.date.getFullYear() + '-' + this.date.getMonth() + '-01';
    endDate: string = this.date.getFullYear() + '-' + (this.date.getMonth()+1) + '-01';
    errorMessage: string;
    page: number;
    pages: number;
    count: number;
    conversations: any[] = [];
    threads: any[] = [];
    jobStatus: string;
    showPostThreads: boolean = true;
    dbConnStatus: string;
    dbConnStatusType: string;
    searchStarted: boolean;
    processingResults: boolean;


    constructor(private _helpscout: HelpscoutService, private _mysql: MysqlService) { }

    ngOnInit() {

    }

    reset() {
        if(this.errorMessage){this.errorMessage = ''}
        if(this.page){ this.page = 0};
        if(this.pages){this.pages = 0};
        if(this.count){this.count = undefined};
        if(this.conversations){this.conversations = []}
        if(this.threads){this.threads = []}
        if(this.jobStatus){this.jobStatus = ''}
        if(this.searchStarted){this.searchStarted = false}
        if(this.processingResults){this.processingResults = false}
    }

    getConvByDate(startDate: string, endDate: string): void {
        // Reset values
        this.reset();

        // Start Search
        this.searchStarted = true;

        // Run Query
        this.startDate = startDate;
        this.endDate = endDate
        console.log('Get Helpscout conversations closed for the following dates:\nStart Date: ' + startDate + '\nEnd Date: ' + endDate);
        this._helpscout.searchConvByDate(startDate, endDate)
            .subscribe(
                data => {
                    this.count = data.count;
                    this.pages = data.pages;
                },
                error => this.errorMessage = <any>error,
                () => {
                    if(this.count < 1){
                        this.count = 0;
                    }
                    this.checkDbConnection();
                }
        );
    }

    getConvByDateAllPages() {
        this.processingResults = true;
        let counter = 0;
        for(let i = 1; i <= this.pages; i++) {
            this._helpscout.searchConvByDate(this.startDate, this.endDate, i)
                .subscribe(
                    data => this.conversations = this.conversations.concat(data.items),
                    error => this.errorMessage = <any>error,
                    () => {
                        counter++;
                        if(counter === this.pages){
                            this.getConvDetails();
                        }
                    }
            );
        }
    }

    getConvDetails() {
        let counter = 0;
        for (let conv of this.conversations) {
            this._helpscout.searchThreadById(conv.id)
                .subscribe(
                    data => this.threads.push(data.item),
                    error => this.errorMessage = <any>error,
                    () => {
                        counter++;
                        if(counter === this.conversations.length){
                            //this.postThreadsToFile();
                            this.postThreadsToMysql();
                        }
                    }
                )
        }
    }

    postThreadsToFile() {
        this.showPostThreads = false;
        this._mysql.postThreadsToFile(this.threads)
            .subscribe(
                data => this.jobStatus = data,
                error => this.errorMessage = <any>error
            )
    }

    postThreadsToMysql() {
        this.showPostThreads = false;
        this._mysql.postThreadsToMysql(this.threads)
            .subscribe(
                data => this.jobStatus = data,
                error => this.errorMessage = <any>error
            )
    }

    checkDbConnection() {
        this.dbConnStatus = '';
        this.dbConnStatusType = '';
        this._mysql.runCheckDbConnection()
            .subscribe(
                data => {
                    if(data === 'Connected'){
                        this.dbConnStatus = data;
                    }else{
                        let err = JSON.parse(data);
                        if(err.error.code === 'POOL_CLOSED'){
                            this.dbConnStatus = 'The connection to the database was closed. Please restart the server and try again.'
                        }else{
                            this.dbConnStatus = 'Error connecting to the os_ticket database. Verify the source IP is whitelisted on BlueHost.';
                        }
                        this.dbConnStatus += '   DETAILS:' + err.message;

                    }
                },
                error => this.errorMessage = <any>error,
                () => {
                    if(this.dbConnStatus === 'Connected') {
                        this.dbConnStatusType = 'alert alert-success';
                    }else{
                        this.dbConnStatusType = 'alert alert-danger';
                    }
                }
            )
    }
}