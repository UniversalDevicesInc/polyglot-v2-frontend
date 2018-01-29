import { Component, OnInit, OnDestroy } from '@angular/core'
import { AddnodeService } from '../../services/addnode.service'
import { DialogService } from 'ng2-bootstrap-modal'
import { ConfirmComponent } from '../confirm/confirm.component'
import { ModalNsUpdateComponent } from '../modal-ns-update/modal-ns-update.component'
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

  Math: any
  public nsList: any
  private subResponses: any
  public received: boolean = false
  private subNsTypes: any
  public installedTypes: any

  constructor(
    private addNodeService: AddnodeService,
    private sockets: WebsocketsService,
    private settingsService: SettingsService,
    private dialogService: DialogService,
    private flashMessage: FlashMessagesService,
  ) { this.Math = Math }

  ngOnInit() {
    this.getNSList()
    this.sockets.start((connected) => {
      if (connected) {
        this.sockets.sendMessage('nodeservers', { 'nodetypes': '' })
        this.getNsTypes()
        this.getNodeServerResponses()
      }
    })
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
    this.dialogService.addDialog(ModalNsUpdateComponent, {
      title: 'Upload profile to ISY?',
      message: `Do you want to re-upload the profile.zip for ${ns.name} to ISY? This will NOT automatically reboot the ISY. Typically only a restart of the admin console is necessary. However, if your expected changes do not appear, please restart the ISY with the 'Reboot ISY' button above. 'No' will proceed with the update WITHOUT uploading the profile.`
    }).subscribe((isConfirmed) => {
      if (isConfirmed !== null) {
        if (isConfirmed) {
          ns['updateProfile'] = isConfirmed
        }
        this.sockets.start((connected) => {
            if (connected) {
              this.sockets.sendMessage('nodeservers', { 'updatens': ns }, false, true)
              delete ns.updateProfile
              this.flashMessage.show(`Updating ${ns.name} please wait...`, {
                cssClass: 'alert-success',
                timeout: 5000})
            }
        })
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

  updateAvailable(ns) {
    let version = '0'
    if (this.installedTypes) {
      let idx = this.installedTypes.findIndex(n => n.name === ns.name)
      if (idx > -1)
        version = this.installedTypes[idx].credits[0].version
    }
    return this.compareVersions(version, '<', ns.version)
  }

  isInstalled(ns) {
    let idx = -1
    if (this.installedTypes)
      idx = this.installedTypes.findIndex(n => n.name === ns.name)
    return idx > -1
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

  compareVersions(v1, comparator, v2) {
    var comparator = comparator == '=' ? '==' : comparator;
    if(['==','===','<','<=','>','>=','!=','!=='].indexOf(comparator) == -1) {
        throw new Error('Invalid comparator. ' + comparator);
    }
    var v1parts = v1.split('.'), v2parts = v2.split('.');
    var maxLen = Math.max(v1parts.length, v2parts.length);
    var part1, part2;
    var cmp = 0;
    for(var i = 0; i < maxLen && !cmp; i++) {
        part1 = parseInt(v1parts[i], 10) || 0;
        part2 = parseInt(v2parts[i], 10) || 0;
        if(part1 < part2)
            cmp = 1;
        if(part1 > part2)
            cmp = -1;
    }
    return eval('0' + comparator + cmp);
  }

}
