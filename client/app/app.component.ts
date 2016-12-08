import { Component, OnInit, Pipe } from '@angular/core';

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
    hsData: any;
    responseJSON: any;

    constructor(private _helpscout: HelpscoutService) { }

    ngOnInit() {
        console.log(this.startDate.toString())
    }

    connectToHelpscout(startDate: string, endDate: string): void {
        let startDateISO = new Date(startDate).toISOString();
        let endDateISO = new Date(endDate).toISOString();
        console.log('Connect to Helpscout for the following Dates:\nStart Date: ' + startDate + '\nEnd Date: ' + endDate);

        this._helpscout.getHelpscout(startDateISO, endDateISO)
            .subscribe(
                data => this.hsData = data,
                error => this.errorMessage = <any>error
        );
    }

    runExpressTest (startDate: string, endDate: string): void {
        let startDateISO = new Date(startDate).toISOString();
        let endDateISO = new Date(endDate).toISOString();

        this._helpscout.expressTest({start: startDateISO, end: endDateISO})
            .subscribe(
                data => this.responseJSON = data
            )
    }

}