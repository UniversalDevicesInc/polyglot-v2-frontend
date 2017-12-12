import { Component, OnInit } from '@angular/core'
import { ValidateService } from '../../services/validate.service'
import { AddnodeService } from '../../services/addnode.service'
import { WebsocketsService } from '../../services/websockets.service'
import { NodeServer } from '../../models/nodeserver.model'
import { FlashMessagesService } from 'angular2-flash-messages'
import { DashboardComponent } from '../dashboard/dashboard.component'
import { Router } from '@angular/router'
import { DialogService } from 'ng2-bootstrap-modal'
import { ConfirmComponent } from '../confirm/confirm.component'


@Component({
  selector: 'app-addnode',
  templateUrl: './addnode.component.html',
  styleUrls: ['./addnode.component.css']
})
export class AddnodeComponent implements OnInit {
  name: string
  profileNum: number
  baseUrl: String
  nodeServers: NodeServer[]

  private subNodeServers: any
  private subNsTypes: any
  public nsTypes: string[] = []
  public indexes: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  public types: string[] = ['Local (Co-Resident with Polyglot)', 'Remote']
  public typeSet: string[] = ['local', 'remote']
  public received: boolean
  public selectedType: string = this.typeSet[0]
  public selectedNS: Object = this.nsTypes[0]

  constructor(
    private validateService: ValidateService,
    private flashMessage: FlashMessagesService,
    private dialogService: DialogService,
    private addNodeService: AddnodeService,
    private sockets: WebsocketsService,
    private router: Router
  ) {}

  onSelect(index) {
    this.profileNum = index
  }

  onSelectType(index) {
    this.selectedType = this.typeSet[index]
  }

  onSelectNS(index) {
    this.selectedNS = this.nsTypes[index]
  }


  ngOnInit() {
    this.received = false
    this.sockets.start((connected) => {
        if (connected) {
          this.sockets.sendMessage('nodeservers', { 'nodetypes': '' })
          this.getNsTypes()
        }
    })
    this.getNodeServers()
  }

  showConfirm() {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Delete NodeServer',
      message: `Adding this NodeServer will automatically reboot the ISY.`})
      .subscribe((isConfirmed) => {
        this.onRegisterSubmit(isConfirmed)
    })
  }

  getNodeServers() {
    this.subNodeServers = this.sockets.nodeServerData.subscribe(nodeServers => {
      this.nodeServers = nodeServers
      this.nodeServers.forEach((ns) => {
        var ind = this.indexes.indexOf(parseInt(ns.profileNum))
        if (ind > -1) {
          this.indexes.splice(ind, 1)
        }
      })
      this.profileNum = this.indexes[0]
    })
  }

  getNsTypes() {
    this.subNsTypes = this.sockets.nsTypeResponse.subscribe(nsTypes => {
      this.received = true
      this.nsTypes = nsTypes.notInUse
      this.selectedNS = this.nsTypes[0]
    })
  }

  onRegisterSubmit(confirmed) {
    if (!confirmed) { return }
    if (this.selectedType === 'local') {
      var name = this.selectedNS['name']
      var path = this.selectedNS['_folder']
    } else {
      name = this.name
    }
    const node = {
      name: name || this.name,
      profileNum: this.profileNum,
      type: this.selectedType,
      path: path || ''
    }
    if (!this.validateService.validateRegister(node)) {
      this.flashMessage.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 3000})
      return false
    }

    if (!this.validateService.validateProfileNum(node.profileNum)) {
      this.flashMessage.show('Please use 1 through 10 for Node Server Number.', {cssClass: 'alert-danger', timeout: 3000})
      return false
    }

    if (this.sockets.connected) {
      this.sockets.sendMessage('nodeservers', {addns: node}, false, true)
      this.flashMessage.show(`Successfully submitted ${node.type} NodeServer ${node.name} at slot ${node.profileNum}`, {cssClass: 'alert-success', timeout: 3000})
      window.scrollTo(0, 0)
      this.router.navigate(['/dashboard'])
    } else {
      this.flashMessage.show('Websockets not connected to Polyglot. Node not added.', {
        cssClass: 'alert-danger',
        timeout: 5000})
      window.scrollTo(0, 0)
    }
  }
}
