import { Injectable } from '@angular/core'
import { Http, Headers, RequestOptions } from '@angular/http'
import 'rxjs/add/operator/map'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class AddnodeService {

  authToken: any
  settings: any
  public upgradeSubject = new Subject<any>()

  upgradeAvailable$ = this.upgradeSubject.asObservable()

  constructor(
    private http: Http
  ) { }

  submitNewNS(url) {
    //var submitURL = 'https://8skwp2eayd.execute-api.us-east-1.amazonaws.com/prod/add'
    var submitURL = 'https://t5b8ulpgfj.execute-api.us-east-1.amazonaws.com/prod/add'
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });
    const body = JSON.stringify({url: url})
    return this.http.post(submitURL, body, options)
      .map(res => res.json())
  }

  getNSList() {
    var nsIndexURL = 'https://t5b8ulpgfj.execute-api.us-east-1.amazonaws.com/prod/list?sort'
    const headers = new Headers()
    return this.http.get(nsIndexURL, {headers: headers})
      .map(res => res.json())
  }

  getPolyglotVersion() {
    try {
      this.settings = JSON.parse(localStorage.getItem('settings'))
      var polyglotVersionDoc
      if (this.settings.useBeta) {
        polyglotVersionDoc = 'https://s3.amazonaws.com/polyglotv2/binaries/beta/beta.json'
      } else {
        polyglotVersionDoc = 'https://s3.amazonaws.com/polyglotv2/binaries/current.json'
      }
      //var polyglotPackage = 'https://raw.githubusercontent.com/UniversalDevicesInc/polyglot-v2/master/package.json'
      const headers = new Headers()
      this.http.get(polyglotVersionDoc, {headers: headers})
        .map(res => res.json())
        .subscribe(doc => this.checkUpgrade(doc))
    } catch (err) {
      console.log(err)
    }
  }

  checkUpgrade(message) {
    this.upgradeSubject.next(message)
  }

}
