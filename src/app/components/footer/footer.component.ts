import { Component, OnInit, OnDestroy } from '@angular/core'
import { WebsocketsService } from '../../services/websockets.service'
import { AuthService } from '../../services/auth.service'
import { SettingsService } from '../../services/settings.service'
import { AddnodeService } from '../../services/addnode.service'
import { FlashMessagesService } from 'angular2-flash-messages'
import { DialogService } from 'ng2-bootstrap-modal'
import { Router } from '@angular/router'
import { ConfirmComponent } from '../confirm/confirm.component'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  Math: any
  private subSettings: any
  private subUpgrade: any
  private gotPackage: boolean = false
  public polyPackage: String
  public isyVersion: String
  public pgVersion: String
  public currentVersion: String
  public updateAvail: boolean = false
  public upgradeData: any
  private upgrading: boolean = false
  private progress = {
    percent: 0
  }
  public polyglot: {
    connected: false
  }

  constructor(
    private dialogService: DialogService,
    private addNodeService: AddnodeService,
    private flashMessage: FlashMessagesService,
    private router: Router,
    private sockets: WebsocketsService,
    private settings: SettingsService,
    private authService: AuthService
  ) { this.Math = Math }

  ngOnInit() {
    this.getPolyglot()
    this.getSettings()
    this.getPolyVersion()
    //setTimeout(() => { this.addNodeService.getPolyglotVersion() }, 1000)
    this.getUpgrade()
  }

  ngOnDestroy() {
    if (this.subUpgrade) { this.subUpgrade.unsubscribe() }
    if (this.subSettings) { this.subSettings.unsubscribe() }
  }

  getPolyglot() {
    this.sockets.polyglotData.subscribe(polyglot => this.polyglot = polyglot)
  }

  getUpgrade() {
    this.subUpgrade = this.sockets.upgradeData.subscribe(data => {
      if (data.hasOwnProperty('start')) {
        if (data.start.success) {
          this.flashMessage.show(data.start.msg, {
            cssClass: 'alert-success',
            timeout: 5000})
        } else {
          this.flashMessage.show(data.start.msg, {
            cssClass: 'alert-danger',
            timeout: 6000})
          this.upgrading = false
          window.scrollTo(0, 0)
        }
      } else if (data.hasOwnProperty('stop')) {
        if (data.stop.success) {
          this.flashMessage.show(data.stop.msg, {
            cssClass: 'alert-success',
            timeout: 5000})
            this.upgrading = false
            window.scrollTo(0, 0)
        } else {
          this.flashMessage.show(data.stop.msg, {
            cssClass: 'alert-danger',
            timeout: 5000})
          this.upgrading = false
          window.scrollTo(0, 0)
        }
      } else if (data.hasOwnProperty('error')) {
        this.flashMessage.show(data.error.msg, {
          cssClass: 'alert-danger',
          timeout: 5000})
        this.upgrading = false
        window.scrollTo(0, 0)
      } else if (data.hasOwnProperty('progress')) {
        this.progress = data.progress
      } else if (data.hasOwnProperty('complete')) {
        this.flashMessage.show(data.complete.msg, {
          cssClass: 'alert-success',
          timeout: 20000})
        this.upgrading = false
        window.scrollTo(0, 0)
        setTimeout(() => {
          this.logout()
        }, 2000)
      }
    })
  }

  logout() {
    this.updateAvail = false
    if (this.subUpgrade) { this.subUpgrade.unsubscribe() }
    if (this.subSettings) { this.subSettings.unsubscribe() }
    this.authService.logout()
    this.sockets.stop()
    this.router.navigate(['/login'])
  }

  getSettings() {
    this.subSettings = this.sockets.settingsData.subscribe(settings => {
      this.isyVersion = settings.isyVersion
      this.pgVersion = settings.pgVersion
    })
  }

  getPolyVersion() {
    this.addNodeService.upgradeAvailable$.subscribe(doc => {
      this.polyPackage = doc
      this.currentVersion = doc.version
      console.log(doc, doc.version)
      this.gotPackage = true
      this.checkUpgrade()
    })
  }

  checkUpgrade() {
    if (this.pgVersion && this.currentVersion) {
      this.updateAvail = this.compareVersions(this.pgVersion, '<', this.currentVersion)
    }
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

  showConfirm() {
    this.dialogService.addDialog(ConfirmComponent, {
      title: `Upgrade Polyglot? New version available ${this.currentVersion}`,
      message: `Upgrading Polyglot from here will automatically download the latest binary for your system type and extract it OVER the existing binary. It will
                then exit Polyglot. If you do NOT have the auto-start scripts installed for linux(systemctl) or OSX(launchctl) then Polyglot will NOT restart
                automatically. You will have to manually restart. If you are not using the binary, upgrade via git. Continue?`
      })
      .subscribe((isConfirmed) => {
        this.upgradeSubmit(isConfirmed)
    })
  }

  upgradeSubmit(confim) {
    this.upgrading = true
    this.sockets.sendMessage('upgrade', {start: ''})
  }

}
