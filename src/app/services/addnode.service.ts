import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import 'rxjs/add/operator/map'

@Injectable()
export class AddnodeService {

  authToken: any

  constructor(
    private http: Http
  ) { }

  registerNodeServer(node) {
    const headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json')
    return this.http.post('http://10.0.0.75:3000/frontend/addns', node, {headers: headers})
      .map(res => res.json())
  }

  loadToken() {
    const token = localStorage.getItem('id_token')
    this.authToken = token
  }

}
