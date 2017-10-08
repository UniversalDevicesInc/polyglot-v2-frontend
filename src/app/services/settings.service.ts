import { Injectable } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { environment } from '../../environments/environment'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'

import { NodeServer } from '../models/nodeserver.model'


@Injectable()
export class SettingsService {

  authToken: any
  settings: any
  currentNode: any

  constructor(private http: Http) { }

  loadToken() {
    const token = localStorage.getItem('id_token')
    this.authToken = token
  }

  getSettings () {
    const headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json')
    return this.http.get(environment.PG_URI + '/frontend/settings', {headers: headers})
      .map(res => res.json())
  }

  setSettings(settings) {
    const headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json')
    return this.http.post(environment.PG_URI + '/frontend/settings', settings, {headers: headers})
      .map(res => res.json())
  }

  setProfile(profile) {
    const headers = new Headers()
    this.loadToken()
    headers.append('Authorization', this.authToken)
    headers.append('Content-Type', 'application/json')
    return this.http.post(environment.PG_URI + '/frontend/settings', profile, {headers: headers})
      .map(res => res.json())
  }

  storeSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  loadSettings() {
    this.settings = JSON.parse(localStorage.getItem('settings'))
    return JSON.parse(localStorage.getItem('settings'))
  }
}
