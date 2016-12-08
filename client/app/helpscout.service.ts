import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class HelpscoutService {

    private _helpscoutUrl: string = 'https://api.helpscout.net/v1/';
    private _apiKey: string = 'ODM4ZjZkZTJhMzRkMTdlMWM0MzA0ODZiNzMyZTI1YTc0YTU1YmFkNTpY';

    headers: Headers = new Headers({
        "Authorization": "Basic " + this._apiKey
    });
    options: RequestOptions = new RequestOptions({
        headers: this.headers
    })

    constructor(private _http: Http) {

    }

    searchConversationsByDate (startDate: string, endDate: string, page?: number): Observable<any> {
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
        let url = 'conversations/'+id+'.json';
        return this.runSearch(url);
    }

    runSearch (url: string) {
        return this._http.get(url, this.options)
            .map((resp: Response) => resp.json())
            .catch(this.handleError)
    }

    expressTest (dates: any) {
        let url = '/mailbox/test'
        return this._http.post(url,dates)
            .map((resp: Response) => resp.text())
            .catch(this.handleError)
    }

    private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }


}