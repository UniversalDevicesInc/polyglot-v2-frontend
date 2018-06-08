import { ElementRef, ViewChild, Component, OnInit, OnDestroy } from '@angular/core'
import { SettingsService } from '../../services/settings.service'
import { WebsocketsService } from '../../services/websockets.service'
import { NodeServer } from '../../models/nodeserver.model'
import { Router, ActivatedRoute } from "@angular/router"
import { SimpleModalService } from 'ngx-simple-modal'
import { ConfirmComponent } from '../confirm/confirm.component'
import { FlashMessagesService } from 'angular2-flash-messages'

@Component({
  selector: 'app-nsdetails',
  templateUrl: './nsdetails.component.html',
  styleUrls: ['./nsdetails.component.css']
})
export class NsdetailsComponent implements OnInit, OnDestroy {
  @ViewChild('nslogScroll') private logScrollContainer: ElementRef

  nodeServers: NodeServer[]
  public mqttConnected: boolean = false
  private subConnected: any
  private subNodeServers: any
  private subResponses: any
  private logConn: any
  public logData: string[]=[]
  public arrayOfKeys: any
  public customParams: any
  public profileNum: any
  public uptime: any
  public uptimeInterval: any
  public selectedNodeServer: any
  public currentlyEnabled: any
  public autoScroll: boolean
  public child: any

  constructor(
    private sockets: WebsocketsService,
    private settingsService: SettingsService,
    private simpleModalService: SimpleModalService,
    private flashMessage: FlashMessagesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
        this.profileNum = params["id"]
      })
  }

  ngOnInit() {
    this.autoScroll = true
    this.getConnected()
    this.getNodeServers()
    this.getNodeServerResponses()
  }

  ngOnDestroy() {
    if (this.logConn) {
      this.logConn.unsubscribe()
      if (this.mqttConnected) {
        this.sockets.sendMessage('log', { stop: this.selectedNodeServer.profileNum })
      }
    }
    if (this.subNodeServers) { this.subNodeServers.unsubscribe() }
    if (this.subResponses) { this.subResponses.unsubscribe() }
    if (this.uptimeInterval) { clearInterval(this.uptimeInterval) }
  }

  getConnected() {
    this.subConnected = this.sockets.mqttConnected.subscribe(connected => {
      this.mqttConnected = connected
    })
  }

  showConfirm(nodeServer) {
    this.simpleModalService.addModal(ConfirmComponent, {
      title: 'Delete NodeServer',
      message: `This will delete the ${nodeServer.name} NodeServer. You will need to restart the ISY admin console to reflect the changes, if you are still having problems, click on 'Reboot ISY' above. Are you sure you want to delete?`})
      .subscribe((isConfirmed) => {
        if (isConfirmed)
          this.deleteNodeServer(nodeServer, isConfirmed)
    })
  }

  confirmNodeDelete(i) {
    this.simpleModalService.addModal(ConfirmComponent, {
      title: 'Delete Node?',
      message: `This will delete the node: ${i.address} from Polyglot and ISY if it exists. Are you sure?`})
      .subscribe((isConfirmed) => {
        if (isConfirmed)
          this.deleteNode(i)
    })
  }

  deleteNode(i) {
    if (this.mqttConnected)
      this.sockets.sendMessage('nodeservers', {removenode: {address: i.address, profileNum: this.selectedNodeServer.profileNum}}, false, true)
    else
      this.showDisconnected()
  }

  deleteNodeServer(nodeServer, confirmed) {
    if (this.mqttConnected) {
      this.sockets.sendMessage('nodeservers', {delns: {profileNum: nodeServer.profileNum}})
      this.router.navigate(['/dashboard'])
    } else this.showDisconnected()
  }

  showControl(type) {
    if (this.currentlyEnabled === type) { return this.currentlyEnabled = null }
    this.currentlyEnabled = type

    if (type === 'log') {
      if (this.mqttConnected) {
        this.sockets.sendMessage('log', { start: this.selectedNodeServer.profileNum })
        this.getLog()
      } else this.showDisconnected()
    } else {
      if (this.logConn) {
        this.logConn.unsubscribe()
        if (this.mqttConnected) {
          this.sockets.sendMessage('log', { stop: this.selectedNodeServer.profileNum })
        }
      }
    }
  }

  showDisconnected() {
    this.flashMessage.show('Error not connected to Polyglot.', {
      cssClass: 'alert-danger',
      timeout: 3000})
  }

  getNodeServers() {
    this.subNodeServers = this.sockets.nodeServerData.subscribe(nodeServers => {
      this.nodeServers = nodeServers
      for (const i in this.nodeServers) {
        if (this.nodeServers[i].profileNum === this.profileNum) {
          this.selectedNodeServer = this.nodeServers[i]
          if (!this.uptimeInterval && this.selectedNodeServer.timeStarted) {
            this.uptimeInterval = setInterval(() => {
              this.calculateUptime()
            }, 1000)
          }
          this.customParams = JSON.parse(JSON.stringify(this.selectedNodeServer.customParams))
          this.arrayOfKeys = Object.keys(this.customParams).sort();
        }
      }
    })
  }

  calculateUptime() {
    //var seconds = Math.floor(()/1000)
    var d = Math.abs(+ new Date() - this.selectedNodeServer.timeStarted) / 1000
    var r = {}
    var s = {
        'Year(s)': 31536000,
        'Month(s)': 2592000,
        'Week(s)': 604800,
        'Day(s)': 86400,
        'Hour(s)': 3600,
        'Minute(s)': 60,
        'Second(s)': 1
    }

    Object.keys(s).forEach(function(key){
        r[key] = Math.floor(d / s[key])
        d -= r[key] * s[key]
    })
    let uptime = ''
    for (let key in r) {
      if (r[key] !== 0 )
        uptime += `${r[key]} ${key} `
    }
    this.uptime = uptime
  }

  savePolls(shortPoll, longPoll) {
    shortPoll = parseInt(shortPoll)
    longPoll = parseInt(longPoll)
    if (typeof shortPoll === 'number' && typeof longPoll === 'number') {
      if (shortPoll < longPoll) {
        if (this.mqttConnected) {
          var message = {
            shortPoll: shortPoll,
            longPoll: longPoll
          }
          var updatedPolls = JSON.parse(JSON.stringify(message))
          updatedPolls['profileNum'] = this.selectedNodeServer.profileNum
          this.sockets.sendMessage('nodeservers', {polls: updatedPolls}, false, true)
        } else this.badValidate('Websockets not connected to Polyglot. Poll Parameters not saved.')
      } else this.badValidate('shortPoll must be smaller than longPoll')
    } else this.badValidate('Both Poll values must be numbers')
  }

  badValidate(message) {
    this.flashMessage.show(message, {
      cssClass: 'alert-danger',
      timeout: 5000})
    window.scrollTo(0, 0)
  }

  saveCustom(key: string, value) {
    this.customParams[key] = value
    this.arrayOfKeys = Object.keys(this.customParams).sort()
  }

  removeCustom(key: string, index) {
    this.arrayOfKeys.splice(index, 1)
    delete this.customParams[key]
  }

  sendCustom() {
    if (this.sockets.connected) {
        // Deepcopy hack
        var updatedParams = JSON.parse(JSON.stringify(this.customParams))
        updatedParams['profileNum'] = this.selectedNodeServer.profileNum
        this.sockets.sendMessage('nodeservers', {customparams: updatedParams}, false, true)
    } else this.badValidate('Websockets not connected to Polyglot. Custom Parameters not saved.')
  }

  getLog() {
    if (this.logConn) { return }
    this.logConn = this.sockets.logData.subscribe(data => {
      try {
        var message = data
        if (message.hasOwnProperty('node')) {
          if (message.node === 'polyglot') {
            this.logData.push(data.log)
            if (this.autoScroll) setTimeout(() => { this.scrollToBottom() }, 100)
          }
        }
      } catch (e) { }
    })
  }

  sendControl(command) {
    if (this.mqttConnected) {
      let cmd = {
        node: this.selectedNodeServer.profileNum,
      }
      cmd[command] = ""
      this.sockets.sendMessage(this.selectedNodeServer.profileNum, cmd, false, false)
      this.flashMessage.show(`Sent ${command} command to NodeServer ${this.selectedNodeServer.name}.`, {
        cssClass: 'alert-success',
        timeout: 5000})
      window.scrollTo(0, 0)
    }
  }

  getNodeServerResponses() {
    this.subResponses = this.sockets.nodeServerResponse.subscribe(response => {
      if (response.hasOwnProperty('success')) {
        if (response.success) {
          this.flashMessage.show(response.msg, {
            cssClass: 'alert-success',
            timeout: 5000})
          window.scrollTo(0, 0)
        } else {
          this.flashMessage.show(response.msg, {
            cssClass: 'alert-danger',
            timeout: 5000})
          window.scrollTo(0, 0)
        }
      }
    })
  }

  scrollToTop() {
    this.logScrollContainer.nativeElement.scrollTop = 0
  }

  scrollToBottom() {
    this.logScrollContainer.nativeElement.scrollTop = this.logScrollContainer.nativeElement.scrollHeight
  }

}
