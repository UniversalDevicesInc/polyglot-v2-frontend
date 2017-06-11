import { Injectable } from '@angular/core'
import { Paho } from 'ng2-mqtt/mqttws31'
import { SettingsService } from './settings.service'
import { AuthService } from './auth.service'
import { NodeServer } from '../models/nodeserver.model'
import { Mqttmessage } from '../models/mqttmessage.model'

import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subject } from 'rxjs/Subject'

@Injectable()
export class WebsocketsService {

  client: Paho.MQTT.Client
  // connected: boolean
  id: string
  _willMessage: Paho.MQTT.Message

  public connected = false
  public polyglotData: ReplaySubject<any> = new ReplaySubject(1)
  public nodeServerData: ReplaySubject<any> = new ReplaySubject(1)
  public settingsData: ReplaySubject<any> = new ReplaySubject(1)
  public nodeServerResponse: Subject<any> = new Subject
  public settingsResponse: Subject<any> = new Subject
  public nsResponses: Array<any> = new Array
  public setResponses: Array<any> = new Array
  private _seq = Math.floor(Math.random() * 90000) + 10000

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService
  ) {}

  start() {
    this.settingsService.loadSettings()
    if (!this.id) {
      this.id = 'polyglot_frontend-' + this.randomString(5)
      // this._seq = Math.floor(Math.random() * 90000) + 10000
    }
    this.client = new Paho.MQTT.Client(this.settingsService.settings.mqttaddress, Number(this.settingsService.settings.mqttwsport), this.id)
    this.onMessage()
    this.onConnectionLost()
    const message = {node: this.id, connected: false}
    this._willMessage = new Paho.MQTT.Message(JSON.stringify(message))
    this._willMessage.destinationName = 'udi/polyglot/connections/frontend'
    this._willMessage.qos = 0
    this._willMessage.retained = false
    this.client.connect(
      {onSuccess: this.onConnected.bind(this),
      willMessage: this._willMessage}
    )
  }

  onConnected() {
    // console.log('Connected')
    this.connected = true
    this.client.subscribe('udi/polyglot/connections/polyglot', null)
    this.client.subscribe('udi/polyglot/frontend/#', null)
    const message = {connected: true}
    this.sendMessage('connections', message)
  }

  sendMessage(topic, message, retained = false, needResponse = false) {
    const msg = JSON.stringify(Object.assign({node: this.id}, message, needResponse ? {seq: this._seq} : undefined))
    if (needResponse) {
      if (topic === 'settings') {
        this.setResponses.push(JSON.parse(msg))
      } else if (topic === 'nodeservers') {
        this.nsResponses.push(JSON.parse(msg))
      }
      this._seq++
    }

    const packet = new Paho.MQTT.Message(msg)
    if (topic === 'connections') { topic = 'udi/polyglot/connections/frontend'
    } else if (topic === 'settings') { topic = 'udi/polyglot/frontend/settings'
    } else if (topic === 'nodeservers') { topic = 'udi/polyglot/frontend/nodeservers'
    } else { topic = 'udi/polyglot/ns/' + topic }
    packet.destinationName = topic
    packet.retained = retained
    this.client.send(packet)
  }

  onMessage() {
    this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
      const msg = JSON.parse(message.payloadString)
      if (msg.node === undefined || msg.node.substring(0, 18) === 'polyglot_frontend-') { return }
      if (message.destinationName === 'udi/polyglot/connections/polyglot') {
        this.processConnection(msg)
      } else if (message.destinationName === 'udi/polyglot/frontend/nodeservers') {
        this.processNodeServers(msg)
      } else if (message.destinationName === 'udi/polyglot/frontend/settings') {
        this.processSettings(msg)
      }
    }
  }

  onConnectionLost() {
    this.client.onConnectionLost = (responseObject: Object) => {
      try {
        setTimeout(() => {
          if (this.authService.loggedIn()) {
            this.client.connect(
              {onSuccess: this.onConnected.bind(this),
              willMessage: this._willMessage}
            )
          }
          setTimeout(() => {
            this.onConnectionLost()
          }, 5000)
        }, 2000)
      } catch (err) {
        console.log(err)
      }
      this.connected = false
    }
  }

  stop() {
    this.client.disconnect()
    this.connected = false
    console.log('MQTT: Disconnected')
  }

  randomString(length) {
      let text = ''
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      for (let i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      return text
  }

  processConnection(message) {
    this.getPolyglot(message)
  }

  getPolyglot(message) {
    Observable.of(message).subscribe(data => this.polyglotData.next(data))
    return this.polyglotData
  }

  processNodeServers(message) {
    if (message.hasOwnProperty('response') && message.hasOwnProperty('seq')) {
        this.nsResponses.forEach((item) => {
          if (item.seq === message.seq) {
            this.nodeServerResponses(message)
            return
          }
        })
    } else {
      this.getNodeServers(message)
    }
  }

  getNodeServers(message) {
    Observable.of(message.nodeservers).subscribe(data => this.nodeServerData.next(data))
    return this.nodeServerData
  }

  nodeServerResponses(message) {
    Observable.of(message.response).subscribe(data => this.nodeServerResponse.next(data))
    return this.nodeServerData
  }

  processSettings(message) {
    if (message.hasOwnProperty('response') && message.hasOwnProperty('seq')) {
        this.setResponses.forEach((item) => {
          if (item.seq === message.seq) {
            this.settingsResponses(message)
            return
          }
        })
    } else {
      this.getSettings(message)
    }
  }

  getSettings(message) {
    Observable.of(message.settings).subscribe(data => this.settingsData.next(data))
    return this.settingsData
  }

  settingsResponses(message) {
    Observable.of(message.response).subscribe(data => this.settingsResponse.next(data))
    return this.settingsData
  }



}
