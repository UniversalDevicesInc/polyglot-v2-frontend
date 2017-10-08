import { Component, OnInit } from '@angular/core'
import { NsdetailsComponent } from '../nsdetails/nsdetails.component'

@Component({
  selector: 'app-customdetails',
  templateUrl: './customdetails.component.html',
  styleUrls: ['./customdetails.component.css']
})
export class CustomdetailsComponent implements OnInit {

  private arrayOfKeys
  private customParams

  constructor(
    public nsdetails: NsdetailsComponent,
  ) {}

  ngOnInit() {
    // Deepcopy hack
    this.customParams = JSON.parse(JSON.stringify(this.nsdetails.selectedNodeServer.customParams))
    this.arrayOfKeys = Object.keys(this.customParams)
  }

  saveCustom(key: string, value) {
    this.customParams[key] = value
    this.arrayOfKeys = Object.keys(this.customParams)
    this.nsdetails.saveCustom(this.customParams)
  }

  removeCustom(key: string, index) {
    this.arrayOfKeys.splice(index, 1)
    delete this.customParams[key]
    this.nsdetails.saveCustom(this.customParams)
  }

  addCustom(key: string, value) {
    this.customParams[key] = value
    this.arrayOfKeys = Object.keys(this.customParams)
    var inputValue = (<HTMLInputElement>document.getElementById('newkey')).value = ''
    var inputValue2 = (<HTMLInputElement>document.getElementById('newvalue')).value = ''
    this.nsdetails.saveCustom(this.customParams)
  }

}
