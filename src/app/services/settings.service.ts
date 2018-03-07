import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'

//import { NodeServer } from '../models/nodeserver.model'


@Injectable()
export class SettingsService {

  authToken: any
  settings: any
  currentNode: any

  constructor(private http: HttpClient) { }

  loadToken() {
    const token = localStorage.getItem('id_token')
    this.authToken = token
  }

  getSettings () {
    this.loadToken()
    const headers = new HttpHeaders({
      Authorization: this.authToken,
      'Content-Type': 'application/json'
    })
    this.http.get(`${environment.PG_URI}/frontend/settings`, {headers: headers})
    .subscribe(settings => {
      this.storeSettings(settings)
    })
  }

  setSettings(settings) {
    this.loadToken()
    const headers = new HttpHeaders({
      Authorization: this.authToken,
      'Content-Type': 'application/json'
    })
    return this.http.post(`${environment.PG_URI}/frontend/settings`, settings, {headers: headers})
  }

  setProfile(profile) {
    this.loadToken()
    const headers = new HttpHeaders({
      Authorization: this.authToken,
      'Content-Type': 'application/json'
    })
    return this.http.post(`${environment.PG_URI}/frontend/settings`, profile, {headers: headers})
  }

  storeSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  loadSettings() {
    this.settings = JSON.parse(localStorage.getItem('settings'))
    return JSON.parse(localStorage.getItem('settings'))
  }
}
