import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { WebsocketsService } from '../../services/websockets.service'


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
    private flashMessage: FlashMessagesService,
    public sockets: WebsocketsService
  ) { }

  ngOnInit() {
    this.getMqttState()
  }

  ngOnDestroy() {
    if (this.subMqttState) { this.subMqttState.unsubscribe() }
  }

  getMqttState() {
    this.subMqttState = this.sockets.mqttConnected.subscribe(mqttState => {
      this.connected = mqttState
    })
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
