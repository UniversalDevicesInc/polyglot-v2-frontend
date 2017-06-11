import { Component, OnInit } from '@angular/core'
import { ValidateService } from '../../services/validate.service'
import { AddnodeService } from '../../services/addnode.service'
import { WebsocketsService } from '../../services/websockets.service'
import { FlashMessagesService } from 'angular2-flash-messages'
import { Router } from '@angular/router'

@Component({
  selector: 'app-addnode',
  templateUrl: './addnode.component.html',
  styleUrls: ['./addnode.component.css']
})
export class AddnodeComponent implements OnInit {
  name: String
  profileNum: number
  baseUrl: String

  public indexes: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  public selectedIndex: number = this.indexes[0]

  constructor(
    private validateService: ValidateService,
    private flashMessage: FlashMessagesService,
    private addNodeService: AddnodeService,
    private sockets: WebsocketsService,
    private router: Router
  ) { }

  onSelect(index) {
    this.profileNum = index
  }

  ngOnInit() {
    this.profileNum = this.selectedIndex
  }

  onRegisterSubmit() {
    const node = {
      name: this.name,
      profileNum: this.profileNum,
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
      this.flashMessage.show('Successfully registered NodeServer ' + node.name, {cssClass: 'alert-success', timeout: 3000})
      window.scrollTo(0, 0)
      this.router.navigate(['/dashboard'])
    } else {
      this.addNodeService.registerNodeServer(node).subscribe(data => {
        if (data.success) {
          this.flashMessage.show('Successfully registered NodeServer ' + data.nodeserver.name + ' ' +
            data.msg, {cssClass: 'alert-success', timeout: 3000})
          this.router.navigate(['/dashboard'])
        } else {
          this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000})
          this.router.navigate(['/addnode'])
        }
      })
    }
  }
}
