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
  //private shortPoll
  //private longPoll

  constructor(
    public nsdetails: NsdetailsComponent,
  ) {}

  ngOnInit() {
  }

  addCustom(key: string, value) {
    this.nsdetails.customParams[key] = value
    this.nsdetails.arrayOfKeys = Object.keys(this.nsdetails.customParams)
    var inputValue = (<HTMLInputElement>document.getElementById('newkey')).value = ''
    var inputValue2 = (<HTMLInputElement>document.getElementById('newvalue')).value = ''
    this.nsdetails.sendCustom()
  }

}
