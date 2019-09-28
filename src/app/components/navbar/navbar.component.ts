import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { WebsocketsService } from '../../services/websockets.service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
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
    private modal: NgbModal,
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
    const modalRef = this.modal.open(ConfirmComponent, { centered: true })
    modalRef.componentInstance.title = 'Reboot ISY?'
    modalRef.componentInstance.body = `This will reboot the ISY. This is usually not necessary. You should try to restart the admin console first. Are you sure?`
    modalRef.result.then((isConfirmed) => {
        if (isConfirmed)
          this.rebootClick()
    }).catch((error) => {})
  }

  showRestartConfirm() {
    const modalRef = this.modal.open(ConfirmComponent, { centered: true })
    modalRef.componentInstance.title = 'Restart Polyglot?'
    modalRef.componentInstance.body = `Like the upgrade procedure this will shut down Polyglot. If you do NOT have the auto-start scripts installed for linux(systemd) or OSX(launchctl) then Polyglot will NOT restart
                automatically. You will have to manually restart. You will be logged out. Continue?`
    modalRef.result.then((isConfirmed) => {
        if (isConfirmed)
          this.restartClick()
    }).catch((error) => {})
  }


  getConnected() {
    this.subConnected = this.sockets.mqttConnected.subscribe(connected => {
      this.mqttConnected = connected
    })
  }

  restartClick() {
    if (this.mqttConnected) {
      this.sockets.sendMessage('nodeservers', {restartPolyglot: {}})
      this.flashMessage.show('Sent Restart command to Polyglot. Please wait till this message disappears to attempt to login again.', {
        cssClass: 'alert-success',
        timeout: 20000})
        setTimeout(() => {
          this.onLogoutClick()
        }, 2000)
    } else
      this.showDisconnected()
  }

  rebootClick() {
    if (this.mqttConnected) {
      this.sockets.sendMessage('nodeservers', {rebootISY: {}})
      this.flashMessage.show('Sent Reboot command to ISY.', {
        cssClass: 'alert-success',
        timeout: 3000})
    } else
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
    this.sockets.stop()
    this.flashMessage.show('You are logged out.', {
      cssClass: 'alert-success',
      timeout: 3000})
    this.router.navigate(['/login'])
  }

}
