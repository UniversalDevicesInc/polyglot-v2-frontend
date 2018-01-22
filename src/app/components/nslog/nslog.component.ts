import { AfterViewChecked, ElementRef, ViewChild, Component, OnInit, OnDestroy } from '@angular/core'
import { environment } from '../../../environments/environment'
import { Observable } from 'rxjs/Rx'
import { WebsocketsService } from '../../services/websockets.service'
import { NsdetailsComponent } from '../nsdetails/nsdetails.component'

@Component({
  selector: 'app-nslog',
  templateUrl: './nslog.component.html',
  styleUrls: ['./nslog.component.css']
})
export class NslogComponent implements OnInit {

  constructor(
    public nsdetails: NsdetailsComponent
  ) { }

  ngOnInit() {

  }



  ngOnDestroy() {
  }


}
