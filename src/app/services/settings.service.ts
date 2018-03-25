import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/toPromise'
import { finalize, tap } from 'rxjs/operators';

import { saveAs } from 'file-saver/FileSaver'

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

  async savePackage(id) {
    var headers = new HttpHeaders().set('Authorization', localStorage.getItem('id_token'))
    const file = await this.http.get(`${environment.PG_URI}/frontend/log/package/${id}`, { observe: 'response', responseType: "blob", headers: headers }).toPromise()
    this.saveToFileSystem(file)
  }

  async downloadLog(id) {
    var headers = new HttpHeaders().set('Authorization', localStorage.getItem('id_token'))
    const file = await this.http.get(`${environment.PG_URI}/frontend/log/${id}`, { observe: 'response', responseType: "blob", headers: headers }).toPromise()
    this.saveToFileSystem(file)
  }

  saveToFileSystem(response) {
    const contentDispositionHeader: string = response.headers.get('content-disposition')
    const parts: string[] = contentDispositionHeader.split(';')
    const filename = parts[1].split('=')[1]
    const blob = new Blob([response.body])
    saveAs(blob, filename)
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
