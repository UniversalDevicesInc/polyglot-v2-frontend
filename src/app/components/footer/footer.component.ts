import { Component, OnInit } from '@angular/core';
import { WebsocketsService } from '../../services/websockets.service';
import { AuthService } from '../../services/auth.service'
import { SettingsService } from '../../services/settings.service'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  private subSettings: any
  public isyVersion: String
  public pgVersion: String
  public polyglot: {
    connected: false
  }

  constructor(
    private sockets: WebsocketsService,
    private settings: SettingsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getPolyglot()
    this.getSettings()
  }

  getPolyglot() {
    this.sockets.polyglotData.subscribe(polyglot => this.polyglot = polyglot)
  }

  getSettings() {
    this.subSettings = this.sockets.settingsData.subscribe(settings => {
      this.isyVersion = settings.isyVersion
      this.pgVersion = settings.pgVersion
    })
  }

}
