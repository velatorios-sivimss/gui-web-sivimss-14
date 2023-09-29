import {Component} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-ver-detalle-factura',
  templateUrl: './ver-detalle-factura.component.html',
  styleUrls: ['./ver-detalle-factura.component.scss']
})
export class VerDetalleFacturaComponent {

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
  }


}
