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
    this.selectedNodeServer = JSON.parse(localStorage.getItem('ns'))
    setTimeout(() => {
      if (!(this.sockets.connected)) {
          this.sockets.start()
      }
    }, 1000)
    this.getNodeServers()
    this.getNodeServerResponses()
  }

  ngOnDestroy() {
    if (this.subNodeServers) { this.subNodeServers.unsubscribe() }
    if (this.subResponses) { this.subResponses.unsubscribe() }
  }

  showConfirm(nodeServer) {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Delete NodeServer',
      message: `This Will delete the ${nodeServer.name} NodeServer. Are you sure?`})
      .subscribe((isConfirmed) => {
        this.deleteNodeServer(nodeServer, isConfirmed)
    });
  }

  deleteNodeServer(nodeServer, confirmed) {
    if (confirmed) {
      this.sockets.sendMessage('nodeservers', {delns: {profileNum: nodeServer.profileNum}}, false, true)
      this.router.navigate(['/dashboard'])
    }
  }

  showControl(type) {
    if (this.currentlyEnabled === type) { return this.currentlyEnabled = null }
    this.currentlyEnabled = type
 }

  getNodeServers() {
    this.subNodeServers = this.sockets.nodeServerData.subscribe(nodeServers => {
      this.nodeServers = nodeServers
      for (const i in this.nodeServers) {
        if (this.nodeServers[i].profileNum === this.profileNum) {
          this.selectedNodeServer = this.nodeServers[i]
          localStorage.setItem('ns', JSON.stringify(this.selectedNodeServer))
        }
      }
    })
  }

  saveCustom(params) {
    if (this.sockets.connected) {
        var updatedParams = JSON.parse(JSON.stringify(params))
        updatedParams['profileNum'] = this.selectedNodeServer.profileNum
        this.sockets.sendMessage('nodeservers', {customparams: updatedParams}, false, true)
    } else {
      this.flashMessage.show('Websockets not connected to Polyglot. Custom Parameters not saved.', {
        cssClass: 'alert-danger',
        timeout: 5000})
      window.scrollTo(0, 0)
    }
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
