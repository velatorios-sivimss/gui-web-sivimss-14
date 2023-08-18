import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-datos-contratante',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.scss']
})
export class DatosContratanteComponent {
  @Input() nombreContratante: string = '';
  @Input() fecha: string = '';
  @Input() tipoFecha: 1 | 2 | 3 | 4 = 1;
  @Input() fechaPago: string = '';
  @Input() concepto: string = '';
}
