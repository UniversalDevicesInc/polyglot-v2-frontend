import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../../services/settings.service'
import { WebsocketsService } from '../../services/websockets.service'
import { NodeServer } from '../../models/nodeserver.model'
import { Router, ActivatedRoute } from "@angular/router"
import { DialogService } from 'ng2-bootstrap-modal'
import { ConfirmComponent } from '../confirm/confirm.component'
import { FlashMessagesService } from 'angular2-flash-messages'

@Component({
  selector: 'app-nsdetails',
  templateUrl: './nsdetails.component.html',
  styleUrls: ['./nsdetails.component.css']
})
export class NsdetailsComponent implements OnInit, OnDestroy {

  nodeServers: NodeServer[]
  private subNodeServers: any
  private subResponses: any
  private logConn: any
  public logData: string[]=[]
  public arrayOfKeys: any
  public customParams: any
  public profileNum: any
  public selectedNodeServer: any
  public currentlyEnabled: any

  constructor(
    private sockets: WebsocketsService,
    private settingsService: SettingsService,
    private dialogService: DialogService,
    private flashMessage: FlashMessagesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
        this.profileNum = params["id"]
      })
  }

  ngOnInit() {
    if (!this.sockets.connected) this.sockets.start()
    this.getNodeServers()
    this.getNodeServerResponses()
  }

  ngOnDestroy() {
    if (this.sockets.connected) {
      this.sockets.sendMessage('log', { stop: this.selectedNodeServer.profileNum })
    }
    if (this.logConn) { this.logConn.unsubscribe() }
    if (this.subNodeServers) { this.subNodeServers.unsubscribe() }
    if (this.subResponses) { this.subResponses.unsubscribe() }
  }

  showConfirm(nodeServer) {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Delete NodeServer',
      message: `This will delete the ${nodeServer.name} NodeServer. You will need to restart the ISY admin console to reflect the changes, if you are still having problems, click on 'Reboot ISY' above. Are you sure you want to delete?`})
      .subscribe((isConfirmed) => {
        this.deleteNodeServer(nodeServer, isConfirmed)
    });
  }

  confirmNodeDelete(i) {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Delete Node?',
      message: `This will delete the node: ${i.address} from Polyglot and ISY if it exists. Are you sure?`})
      .subscribe((isConfirmed) => {
        this.deleteNode(i)
    });
  }

  deleteNode(i) {
    this.sockets.sendMessage('nodeservers', {removenode: {address: i.address, profileNum: this.selectedNodeServer.profileNum}}, false, true)
  }

  deleteNodeServer(nodeServer, confirmed) {
    if (confirmed) {
      this.sockets.sendMessage('nodeservers', {delns: {profileNum: nodeServer.profileNum}})
      this.router.navigate(['/dashboard'])
    }
  }

  showControl(type) {
    if (this.currentlyEnabled === type) { return this.currentlyEnabled = null }
    this.currentlyEnabled = type
    if (type === 'log') {
      if (this.sockets.connected) {
        this.sockets.sendMessage('log', { start: this.selectedNodeServer.profileNum })
        this.getLog()
      }
    }

 }

  getNodeServers() {
    this.subNodeServers = this.sockets.nodeServerData.subscribe(nodeServers => {
      this.nodeServers = nodeServers
      for (const i in this.nodeServers) {
        if (this.nodeServers[i].profileNum === this.profileNum) {
          this.selectedNodeServer = this.nodeServers[i]
          this.customParams = JSON.parse(JSON.stringify(this.selectedNodeServer.customParams))
          this.arrayOfKeys = Object.keys(this.customParams)
        }
      }
    })
  }

  savePolls(shortPoll, longPoll) {
    shortPoll = parseInt(shortPoll)
    longPoll = parseInt(longPoll)
    if (typeof shortPoll === 'number' && typeof longPoll === 'number') {
      if (shortPoll < longPoll) {
        if (this.sockets.connected) {
          var message = {
            shortPoll: shortPoll,
            longPoll: longPoll
          }
          var updatedPolls = JSON.parse(JSON.stringify(message))
          updatedPolls['profileNum'] = this.selectedNodeServer.profileNum
          this.sockets.sendMessage('nodeservers', {polls: updatedPolls}, false, true)
        } else {
          this.flashMessage.show('Websockets not connected to Polyglot. Poll Parameters not saved.', {
            cssClass: 'alert-danger',
            timeout: 5000})
          window.scrollTo(0, 0)
        }
      } else {
        this.badValidate('shortPoll must be smaller than longPoll')
      }
    } else {
      this.badValidate('Both Poll values must be numbers')
    }
  }

  badValidate(message) {
    this.flashMessage.show(message, {
      cssClass: 'alert-danger',
      timeout: 5000})
    window.scrollTo(0, 0)
  }

  saveCustom(key: string, value) {
    this.customParams[key] = value
    this.arrayOfKeys = Object.keys(this.customParams)
    this.sendCustom()
  }

  removeCustom(key: string, index) {
    this.arrayOfKeys.splice(index, 1)
    delete this.customParams[key]
    this.sendCustom()
  }

  sendCustom() {
    if (this.sockets.connected) {
        // Deepcopy hack
        var updatedParams = JSON.parse(JSON.stringify(this.customParams))
        updatedParams['profileNum'] = this.selectedNodeServer.profileNum
        this.sockets.sendMessage('nodeservers', {customparams: updatedParams}, false, true)
    } else {
      this.flashMessage.show('Websockets not connected to Polyglot. Custom Parameters not saved.', {
        cssClass: 'alert-danger',
        timeout: 5000})
      window.scrollTo(0, 0)
    }
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

  sendControl(command) {
    if (this.sockets.connected) {
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

}
