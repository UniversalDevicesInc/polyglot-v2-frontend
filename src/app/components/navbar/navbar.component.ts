import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { WebsocketsService } from '../../services/websockets.service'
import { DialogService } from 'ng2-bootstrap-modal'
import { ConfirmComponent } from '../confirm/confirm.component'


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isCollapsed:boolean = true
  connected: boolean = false
  private subMqttState: any

  constructor(
    public authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    private flashMessage: FlashMessagesService,
    public sockets: WebsocketsService
  ) { }

  ngOnInit() {
    this.getMqttState()
  }

  ngOnDestroy() {
    if (this.subMqttState) { this.subMqttState.unsubscribe() }
  }

  showConfirm() {
    this.dialogService.addDialog(ConfirmComponent, {
      title: 'Reboot ISY?',
      message: `This will reboot the ISY. This is usually not necessary. You should try to restart the admin console first. Are you sure?`})
      .subscribe((isConfirmed) => {
        this.rebootClick()
    })
  }

  getMqttState() {
    this.subMqttState = this.sockets.mqttConnected.subscribe(mqttState => {
      this.connected = mqttState
    })
  }

  rebootClick() {
    this.sockets.sendMessage('nodeservers', {rebootISY: {}})
  }

  onLogoutClick() {
    this.authService.logout()
    if (this.subMqttState) { this.subMqttState.unsubscribe() }
    this.sockets.stop()
    this.flashMessage.show('You are logged out.', {
      cssClass: 'alert-success',
      timeout: 3000
    })
    this.router.navigate(['/login'])
    return false
  }

}
