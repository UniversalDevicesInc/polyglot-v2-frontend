import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { WebsocketsService } from '../../services/websockets.service'
import { SettingsService } from '../../services/settings.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {

  public profileForm: FormGroup
  user: Object

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService,
    public sockets: WebsocketsService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      username: '',
      password: ''
    })
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user
      this.profileForm.patchValue({
        username: profile.user.username
      })
    },
  err => {
    console.log(err)
    return false
  })
  }

  logout() {
    if (this.sockets && this.sockets.connected) {
      this.sockets.sendMessage('connections', {connected: false})
      this.sockets.stop()
    }
    this.authService.logout()
    this.flashMessage.show('Password Changed. Logging you out.', {
      cssClass: 'alert-success',
      timeout: 3000
    })
    this.router.navigate(['/login'])
    return false
  }


  getDirtyValues(cg) {
    const dirtyValues = {}
    Object.keys(cg.controls).forEach((c) => {
      const currentControl = cg.get(c)

      if (currentControl.dirty) {
        if (currentControl.controls) {
          dirtyValues[c] = this.getDirtyValues(currentControl)
        } else {
          dirtyValues[c] = currentControl.value
        }
      }
    })
    return dirtyValues
  }

  saveProfile(profile) {
    if (this.sockets.connected) {
      if (JSON.stringify(profile) !== '{}') {
        profile['_id'] = this.user['_id']
        this.sockets.sendMessage('settings', {updateprofile: profile}, false, true)
        this.flashMessage.show('Profile saved successfully.', {
          cssClass: 'alert-success',
          timeout: 5000})
        window.scrollTo(0, 0)
        this.logout()
      }
    } else {
      this.flashMessage.show('Websockets not connected to Polyglot. Profile not saved.', {
        cssClass: 'alert-danger',
        timeout: 5000})
      window.scrollTo(0, 0)
    }
  }

}
