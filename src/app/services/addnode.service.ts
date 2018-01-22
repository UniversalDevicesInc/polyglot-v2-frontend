import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { environment } from '../../environments/environment'
import 'rxjs/add/operator/map'

@Injectable()
export class AddnodeService {

  authToken: any

  constructor(
    private http: Http
  ) { }

  /*
  registerNodeServer(node) {
    const headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json')
    return this.http.post(environment.PG_URI + '/frontend/addns', node, {headers: headers})
      .map(res => res.json())
  }
  */

  loadToken() {
    const token = localStorage.getItem('id_token')
    this.authToken = token
  }

  getNSList() {
    var nsIndexURL = 'https://s3.amazonaws.com/3csolutions/udi/nsindex/index.json'
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
