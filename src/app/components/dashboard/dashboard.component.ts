import { Component, OnInit, OnDestroy } from '@angular/core'
import { WebsocketsService } from '../../services/websockets.service'
import { FlashMessagesService } from 'angular2-flash-messages'
import { NodeServer } from '../../models/nodeserver.model'
import { Router } from '@angular/router'
import { DialogService } from 'ng2-bootstrap-modal'
import { ConfirmComponent } from '../confirm/confirm.component'
import { NodepopComponent } from '../nodepop/nodepop.component'
import { SettingsService } from '../../services/settings.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  nodeServers: NodeServer[]
  confirmResult: boolean = null
  nodeDetails: any
  selectedNode: any
  private subNodeServers: any
  private subResponses: any


  constructor(
    private sockets: WebsocketsService,
    private flashMessage: FlashMessagesService,
    private dialogService: DialogService,
    private router: Router,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      if (!(this.sockets.connected)) {
          this.sockets.start()
      }
    }, 1000)
    this.getNodeServers()
    this.getNodeServerResponses()
    this.nodeDetails = null;
  }

  ngOnDestroy() {
    if (this.subNodeServers) { this.subNodeServers.unsubscribe() }
    if (this.subResponses) { this.subResponses.unsubscribe() }
  }

  deleteNodeServer(nodeServer, confirmed) {
    if (confirmed) {
      this.sockets.sendMessage('nodeservers', {delns: {profileNum: nodeServer.profileNum}}, false, true)
    }
  }

  showConfirm(nodeServer) {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Delete NodeServer',
      message: `This Will delete the ${nodeServer.name} NodeServer. Are you sure?`})
      .subscribe((isConfirmed) => {
        this.deleteNodeServer(nodeServer, isConfirmed)
    });
  }

  showNodes(nodeServer) {
    if (this.selectedNode === nodeServer) { return this.selectedNode = null}
    if (nodeServer.nodes.length === 0) {
      this.flashMessage.show('This NodeServer has no nodes defined.', {
        cssClass: 'alert-danger',
        timeout: 3000})
      return window.scrollTo(0, 0)
    }
    this.selectedNode = nodeServer
   /*this.dialogService.addDialog(NodepopComponent, {
     title: `${nodeServer.name} nodes`,
     message: nodeServer.nodes},
     { closeByClickingOutside:true }) */
 }

  getNodeServers() {
    this.subNodeServers = this.sockets.nodeServerData.subscribe(nodeServers => {
      this.nodeServers = nodeServers
      if (this.selectedNode) {
        for (const i in this.nodeServers) {
          if (this.nodeServers[i].profileNum === this.selectedNode.profileNum) {
            this.selectedNode = this.nodeServers[i]
          }
        }
      }
    })
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

  redirect(profileNum) {
    //this.settingsService.currentNode = profileNum
    this.router.navigate(['/nsdetails', profileNum])
  }

}
