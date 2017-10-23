import { Component, OnInit } from '@angular/core'
import { NsdetailsComponent } from '../nsdetails/nsdetails.component'

@Component({
  selector: 'app-nscontrol',
  templateUrl: './nscontrol.component.html',
  styleUrls: ['./nscontrol.component.css']
})
export class NscontrolComponent implements OnInit {

  constructor(
    public nsdetails: NsdetailsComponent,
  ) { }

  ngOnInit() {
  }

  sendControl(type) {
    this.nsdetails.sendControl(type)
  }

}
