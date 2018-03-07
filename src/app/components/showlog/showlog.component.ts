import { Component, OnInit, OnDestroy } from '@angular/core'
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs/Rx'
import { WebsocketsService } from '../../services/websockets.service'
import { FlashMessagesService } from 'angular2-flash-messages'

@Component({
  selector: 'app-showlog',
  templateUrl: './showlog.component.html',
  styleUrls: ['./showlog.component.css']
})
export class ShowlogComponent implements OnInit, OnDestroy {

  public mqttConnected: boolean = false
  private subConnected: any
  public logData: string[]=[]
  private logConn: any
  private actionUrl: string
  private headers: Headers
  private websocket: any
  private receivedMsg: any

  constructor(
    private sockets: WebsocketsService,
    private flashMessage: FlashMessagesService
  ) {}

  ngOnInit() {
    this.getConnected()
    this.getLog()
  }

  ngOnDestroy() {
    if (this.subConnected) this.subConnected.unsubscribe()
    if (this.logConn) this.logConn.unsubscribe()
    if (this.mqttConnected)
      this.sockets.sendMessage('log', { stop: 'polyglot' })
  }

  getConnected() {
    this.subConnected = this.sockets.mqttConnected.subscribe(connected => {
      this.mqttConnected = connected
      if (connected)
        this.sockets.sendMessage('log', { start: 'polyglot' })
    })
  }

  getLog() {
    if (this.logConn) { return }
    this.logConn = this.sockets.logData.subscribe(data => {
      try {
        var message = data
        if (message.hasOwnProperty('node')) {
          if (message.node === 'polyglot') {
            this.logData.push(data.log)
          }
        }
      } catch (e) { }
    })
  }

  showDisconnected() {
    this.flashMessage.show('Error not connected to Polyglot.', {
      cssClass: 'alert-danger',
      timeout: 3000})
  }

  /*
  public GetInstanceStatus(): Observable<any>{
    var wsURI = environment.WS_URI || 'ws://' + location.hostname + ':' + location.port
    this.websocket = new WebSocket(wsURI + "/ws/udi/polyglot/log")
    this.websocket.onopen =  (evt) => {}

    return Observable.fromEvent(this.websocket, 'message')
      .map(res => res['data'])
  }

  CopyToClipboard(containerid) {
    var range = document.createRange();
     range.selectNode(document.getElementById(containerid));
     window.getSelection().addRange(range);
     document.execCommand("Copy");
     alert("text copied")
   }
   */

}
