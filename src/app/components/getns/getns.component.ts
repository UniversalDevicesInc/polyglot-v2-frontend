import { Component, OnInit, OnDestroy } from '@angular/core'
import { AddnodeService } from '../../services/addnode.service'
import { DialogService } from 'ng2-bootstrap-modal'
import { ConfirmComponent } from '../confirm/confirm.component'
import { FlashMessagesService } from 'angular2-flash-messages'
import { SettingsService } from '../../services/settings.service'
import { WebsocketsService } from '../../services/websockets.service'
import _ from "lodash"

@Component({
  selector: 'app-getns',
  templateUrl: './getns.component.html',
  styleUrls: ['./getns.component.css']
})
export class GetnsComponent implements OnInit, OnDestroy {

  public nsList: any
  private subResponses: any
  public received: boolean = false
  private subNsTypes: any
  public installedTypes: string[] = []

  constructor(
    private addNodeService: AddnodeService,
    private sockets: WebsocketsService,
    private settingsService: SettingsService,
    private dialogService: DialogService,
    private flashMessage: FlashMessagesService,
  ) { }

  ngOnInit() {
    this.getNSList()
    if (!this.sockets.connected) {
      this.sockets.start()
    } else {
      this.sockets.sendMessage('nodeservers', { 'nodetypes': '' })
      this.getNsTypes()
      this.getNodeServerResponses()
    }
  }

  ngOnDestroy() {
    if (this.subResponses) { this.subResponses.unsubscribe() }
  }

  getNSList() {
    this.addNodeService.getNSList().subscribe(nsList => {
      this.nsList = nsList
      this.received = true
    })
    this.flashMessage.show(`Refreshed NodeServers List from Server.`, {
      cssClass: 'alert-success',
      timeout: 3000})
  }

  installNS(ns, confirmed) {
    if (!confirmed) { return }
    this.sockets.start((connected) => {
        if (connected) {
          this.sockets.sendMessage('nodeservers', { 'installns': ns }, false, true)
          this.flashMessage.show(`Installing ${ns.name} please wait...`, {
            cssClass: 'alert-success',
            timeout: 5000})
        }
    })
  }

  updateNS(ns) {
    this.sockets.start((connected) => {
        if (connected) {
          this.sockets.sendMessage('nodeservers', { 'updatens': ns }, false, true)
          this.flashMessage.show(`Updating ${ns.name} please wait...`, {
            cssClass: 'alert-success',
            timeout: 5000})
        }
    })
  }

  uninstallNS(ns, confirmed) {
    if (!confirmed) { return }
    this.sockets.start((connected) => {
        if (connected) {
          this.sockets.sendMessage('nodeservers', { 'uninstallns': ns }, false, true)
          this.flashMessage.show(`Uninstalling ${ns.name} please wait...`, {
            cssClass: 'alert-success',
            timeout: 5000})
        }
    })
  }

  isInstalled(ns) {
    return (_.includes(this.installedTypes, ns.name))
  }

  addConfirm(ns) {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Install NodeServer?',
      message: `Do you really want to install the NodeServer named ${ns.name}? This will clone the repository from: ${ns.url}`})
      .subscribe((isConfirmed) => {
        this.installNS(ns, isConfirmed)
    })
  }

  delConfirm(ns) {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Uninstall NodeServer?',
      message: `Do you really want to uninstall the NodeServer named ${ns.name}? This will completely delete the NodeServer folder from Polyglot. CANNOT BE UNDONE.`})
      .subscribe((isConfirmed) => {
        this.uninstallNS(ns, isConfirmed)
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

  getNsTypes() {
    this.subNsTypes = this.sockets.nsTypeResponse.subscribe(nsTypes => {
      this.received = true
      this.installedTypes = nsTypes.installed
    })
  }

}
