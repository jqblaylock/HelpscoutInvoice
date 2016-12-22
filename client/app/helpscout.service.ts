import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';

@Injectable()
export class HelpscoutService {

    private _helpscoutUrl: string = 'https://api.helpscout.net/v1/';
    //private _apiKey: string = 'ODM4ZjZkZTJhMzRkMTdlMWM0MzA0ODZiNzMyZTI1YTc0YTU1YmFkNTpY';
    private _apiKey: string;
    options: RequestOptions;

    constructor(private _http: Http) {
        this.load()
            .subscribe(
                data => this._apiKey = data.apiKey,
                error => console.log(error),
                () => {
                    this.options = new RequestOptions({
                        headers: new Headers({"Authorization": "Basic " + this._apiKey})
                    })
                }
            )
    }

    load () {
        let url = '/config/load'
        return this._http.get(url)
            .map((resp: Response) => resp.json())
            .catch(this.handleError)
    }

    searchConvByDate (startDate: string, endDate: string, page?: number): Observable<any> {
        startDate = new Date(startDate).toISOString();
        endDate = new Date(endDate).toISOString();
        let url = this._helpscoutUrl + 'search/conversations.json?query=(status:"closed"%20AND%20mailboxid:79656%20AND%20' +
                         'modifiedAt:['+startDate+'%20TO%20'+endDate+'])';
        if(page){
            url = url + '&page=' + page;
        }
        return this.runSearch(url);
    }

    searchThreadById (id: number): Observable<any> {
        let url = this._helpscoutUrl + 'conversations/'+id+'.json';
        return this.runSearch(url);
    }

    runSearch (url: string) {
        return this._http.get(url, this.options)
            .retryWhen(
                error => {
                    //error.do(data => console.log(data));
                    return error.delay(65000);
                }
            )
            .map(resp => resp.json())
            .catch(this.handleError)
    }

    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        //console.error('handleError:  ' + error);
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }

        return Observable.throw(errMsg);
    }


}