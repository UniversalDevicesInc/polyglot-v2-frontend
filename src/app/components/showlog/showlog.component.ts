import { Component, OnInit, OnDestroy } from '@angular/core'
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs/Rx'
import { WebsocketsService } from '../../services/websockets.service'

@Component({
  selector: 'app-showlog',
  templateUrl: './showlog.component.html',
  styleUrls: ['./showlog.component.css']
})
export class ShowlogComponent implements OnInit, OnDestroy {

  public logData: string[]=[]
  private logConn: any
  private actionUrl: string
  private headers: Headers
  private websocket: any
  private receivedMsg: any

  constructor(
    private sockets: WebsocketsService,
  ) {}

  ngOnInit() {
    this.sockets.start((connected) => {
        if (connected) {
          this.sockets.sendMessage('log', { start: 'polyglot' })
          this.getLog()
        }
    })
  }

  ngOnDestroy() {
    if (this.sockets.connected) {
      this.sockets.sendMessage('log', { stop: 'polyglot' })
    }
    if (this.logConn) { this.logConn.unsubscribe() }
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
