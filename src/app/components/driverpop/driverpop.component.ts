import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-driverpop',
  templateUrl: './driverpop.component.html',
  styleUrls: ['./driverpop.component.css']
})
export class DriverpopComponent {

  @Input() drivers: any
  @Input() selectedNode: any
  constructor() { }


}
