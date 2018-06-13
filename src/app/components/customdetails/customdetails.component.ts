import { Component, OnInit } from '@angular/core'
import { NsdetailsComponent } from '../nsdetails/nsdetails.component'

@Component({
  selector: 'app-customdetails',
  templateUrl: './customdetails.component.html',
  styleUrls: ['./customdetails.component.css']
})
export class CustomdetailsComponent implements OnInit {

  helpCollapsed = false

  constructor(
    public nsdetails: NsdetailsComponent
  ) {}

  ngOnInit() {
  }

  addCustom(key: string, value) {
    (<HTMLInputElement>document.getElementById('newkey')).value = '';
    (<HTMLInputElement>document.getElementById('newvalue')).value = '';
    this.nsdetails.saveCustom(key, value)
  }

}
