import { Component, OnInit } from '@angular/core'
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal'
import { FormsModule } from '@angular/forms'

export interface ConfirmModel {
  title: string
  message: string
}

@Component({
  selector: 'app-modal-ns-add',
  templateUrl: './modal-ns-add.component.html',
  styleUrls: ['./modal-ns-add.component.css']
})

export class ModalNsAddComponent extends DialogComponent<ConfirmModel, string> implements ConfirmModel {
  title: string
  message: string
  nslink: string

  constructor(
    dialogService: DialogService
  ) {
    super(dialogService)
  }

  submit() {
    // on click on confirm button we set dialog result as true,
    // ten we can get dialog result from caller code
    this.result = this.nslink
    this.close()
  }

  cancel() {
    this.result = null
    this.close()
  }

}
