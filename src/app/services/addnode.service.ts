import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class AddnodeService {

  authToken: any

  constructor(
    private http: Http
  ) { }

  getNSList() {
    var nsIndexURL = 'https://8skwp2eayd.execute-api.us-east-1.amazonaws.com/prod/list?sort'
    const headers = new Headers()
    return this.http.get(nsIndexURL, {headers: headers})
      .map(res => res.json())
  }

  getPolyglotVersion() {
    var polyglotPackage = 'https://raw.githubusercontent.com/UniversalDevicesInc/polyglot-v2/master/package.json'
    const headers = new Headers()
    return this.http.get(polyglotPackage, {headers: headers})
      .map(res => res.json())
  }

}
