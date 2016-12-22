import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class MysqlService {

    constructor(private _http: Http) { }

    postThreadsToFile (threads: any[]) {
        let url = '/helpscout/file';
        return this._http.post(url,threads)
            .map((resp: Response) => resp.text())
            .catch(this.handleError)
    }

    postThreadsToMysql (threads: any[]) {
        let url = '/helpscout/mysql';
        return this._http.post(url,threads)
            .map((resp: Response) => resp.text())
            .catch(this.handleError)
    }

    runCheckDbConnection () {
        let url = '/helpscout/dbConn';
        return this._http.get(url)
            .map((resp: Response) => resp.text())
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