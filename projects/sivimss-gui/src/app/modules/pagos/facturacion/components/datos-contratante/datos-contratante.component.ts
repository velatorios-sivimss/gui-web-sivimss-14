import {Component, Input} from '@angular/core';
import {ServiciosContratados} from "../../models/serviciosContratados.interface";
import {MetodosPagoFact} from "../../models/metodosPagoFact.interface";

@Component({
  selector: 'app-datos-contratante',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.scss']
})
export class DatosContratanteComponent {
  @Input() nombreContratante: string = '';
  @Input() fecha: string = '';
  @Input() tipoFecha: 1 | 2 | 3 | 4 | 5 = 1;
  @Input() fechaPago: string = '';
  @Input() concepto: string = '';
  @Input() servicios: ServiciosContratados[] = [];
  @Input() metodosPago: MetodosPagoFact[] = [];
  @Input() activeIndex: number = 0;
  @Input() totalPagado: number = 0;
  @Input() totalServicios: number = 0;
  @Input() numeroRecibo: string = '';
}
