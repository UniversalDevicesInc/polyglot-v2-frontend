import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { WebsocketsService } from '../../services/websockets.service'


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    public sockets: WebsocketsService
  ) { }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      if (!this.sockets.connected) {
          this.sockets.start()
      }
    }
  }

  onLogoutClick() {
    if (this.sockets && this.sockets.connected) {
      this.sockets.sendMessage('connections', {connected: false})
      this.sockets.stop()
    }
    this.authService.logout()
    this.flashMessage.show('You are logged out.', {
      cssClass: 'alert-success',
      timeout: 3000
    })
    this.router.navigate(['/login'])
    return false
  }

}
