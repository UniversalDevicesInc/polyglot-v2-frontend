import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { WebsocketsService } from '../../services/websockets.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private sockets: WebsocketsService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      if (!this.sockets.connected) this.sockets.start()
    }
  }

}
