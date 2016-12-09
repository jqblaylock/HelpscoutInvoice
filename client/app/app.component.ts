import { Component, OnInit } from '@angular/core';

import { HelpscoutService } from './helpscout.service';
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


    constructor(private _helpscout: HelpscoutService) { }

    ngOnInit() {
        console.log(this.startDate.toString())
    }

    getConvByDate(startDate: string, endDate: string): void {
        this.startDate = startDate;
        this.endDate = endDate
        console.log('Get Helpscout conversations closed for the following dates:\nStart Date: ' + startDate + '\nEnd Date: ' + endDate);
        this.count = 0;
        this._helpscout.searchConvByDate(startDate, endDate)
            .subscribe(
                data => {
                    this.count = data.count;
                    this.pages = data.pages;
                },
                error => this.errorMessage = <any>error
        );
    }

    getConvByDateAllPages() {
        for(let i = 1; i <= this.pages; i++) {
            this._helpscout.searchConvByDate(this.startDate, this.endDate, i)
                .subscribe(
                    data => this.conversations = this.conversations.concat(data.items),
                    error => this.errorMessage = <any>error
            );
        }
    }

    getConvDetails() {
        for (let conv of this.conversations) {
            this._helpscout.searchThreadById(conv.id)
                .subscribe(
                    data => {
                        this.threads.push(data);
                    },
                    error => this.errorMessage = <any>error
                )
        }
    }



    // runExpressTest (startDate: string, endDate: string): void {
    //     let startDateISO = new Date(startDate).toISOString();
    //     let endDateISO = new Date(endDate).toISOString();

    //     this._helpscout.expressTest({start: startDateISO, end: endDateISO})
    //         .subscribe(
    //             data => this.responseJSON = data
    //         )
    // }

}