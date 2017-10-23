import { Component, OnInit, OnDestroy } from '@angular/core'
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs/Rx'
import { WebsocketsService } from '../../services/websockets.service'
import { NsdetailsComponent } from '../nsdetails/nsdetails.component'

@Component({
  selector: 'app-nslog',
  templateUrl: './nslog.component.html',
  styleUrls: ['./nslog.component.css']
})
export class NslogComponent implements OnInit {

  public logData: string[]=[]
  private logConn: any

  constructor(
    private sockets: WebsocketsService,
    public nsdetails: NsdetailsComponent
  ) { }

  ngOnInit() {
    this.sockets.start((connected) => {
        if (connected) {
          this.sockets.sendMessage('log', { start: this.nsdetails.selectedNodeServer.profileNum })
          this.getLog()
        }
    })
  }

  ngOnDestroy() {
    if (this.sockets.connected) {
      this.sockets.sendMessage('log', { stop: this.nsdetails.selectedNodeServer.profileNum })
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

}
