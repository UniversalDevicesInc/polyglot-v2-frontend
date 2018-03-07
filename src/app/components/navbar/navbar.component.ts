import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { WebsocketsService } from '../../services/websockets.service'
import { SimpleModalService } from 'ngx-simple-modal'
import { ConfirmComponent } from '../confirm/confirm.component'


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isCollapsed: boolean = true
  public mqttConnected: boolean = false
  private subConnected: any

  constructor(
    public authService: AuthService,
    private router: Router,
    private simpleModalService: SimpleModalService,
    private flashMessage: FlashMessagesService,
    public sockets: WebsocketsService
  ) { }

  ngOnInit() {
    this.getConnected()
  }

  ngOnDestroy() {
    if (this.subConnected) { this.subConnected.unsubscribe() }
  }

  showConfirm() {
    this.simpleModalService.addModal(ConfirmComponent, {
      title: 'Reboot ISY?',
      message: `This will reboot the ISY. This is usually not necessary. You should try to restart the admin console first. Are you sure?`})
      .subscribe((isConfirmed) => {
        if (isConfirmed)
          this.rebootClick()
    })
  }


  getConnected() {
    this.subConnected = this.sockets.mqttConnected.subscribe(connected => {
      this.mqttConnected = connected
    })
  }

  rebootClick() {
    if (this.mqttConnected)
      this.sockets.sendMessage('nodeservers', {rebootISY: {}})
    else
      this.showDisconnected()
  }

  showDisconnected() {
    this.flashMessage.show('Error not connected to Polyglot.', {
      cssClass: 'alert-danger',
      timeout: 3000})
  }

  onLogoutClick() {
    this.authService.logout()
    if (this.subConnected) { this.subConnected.unsubscribe() }
    //this.sockets.stop()
    this.flashMessage.show('You are logged out.', {
      cssClass: 'alert-success',
      timeout: 3000
    })
    this.router.navigate(['/login'])
  }

}
