import {Component} from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-modal-comision',
  templateUrl: './modal-comision.component.html',
  styleUrls: ['./modal-comision.component.scss']
})
export class ModalComisionComponent {

  constructor(
    private router: Router,
    private readonly ref: DynamicDialogRef,
  ) {
  }

  aceptar(): void {
    this.ref.close();
  }

}
