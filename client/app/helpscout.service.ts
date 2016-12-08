import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class HelpscoutService {
    private _helpscoutUrl: string = 'https://api.helpscout.net/v1/';
    private _pages: string;
    headers: Headers = new Headers({
        "Authorization": "Basic ODM4ZjZkZTJhMzRkMTdlMWM0MzA0ODZiNzMyZTI1YTc0YTU1YmFkNTpY"
    });
    options: RequestOptions = new RequestOptions({
        headers: this.headers
    })

    constructor(private _http: Http) {

     }

    getHelpscout (startDate: string, endDate: string) {
        let path = 'search/conversations.json?query=(status:"closed"%20AND%20mailboxid:79656%20AND%20' +
                         'modifiedAt:['+startDate+'%20TO%20'+endDate+'])&page=1';
        let fullUrl = this._helpscoutUrl + path;
        console.log(fullUrl);
        return this._http.get(fullUrl, this.options)
            .map((resp: Response) => resp.json())
            .catch(this.handleError)
    }

    getPages (startDate: string, endDate: string) {
        let path = 'search/conversations.json?query=(status:"closed"%20AND%20mailboxid:79656%20AND%20' +
                         'modifiedAt:['+startDate+'%20TO%20'+endDate+'])&page=1';
        let fullUrl = this._helpscoutUrl + path;
        return this._http.get(fullUrl, this.options)
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