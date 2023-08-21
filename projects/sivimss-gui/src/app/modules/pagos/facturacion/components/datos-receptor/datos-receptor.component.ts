import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-datos-receptor',
  templateUrl: './datos-receptor.component.html',
  styleUrls: ['./datos-receptor.component.scss']
})
export class DatosReceptorComponent {
  @Input() nombreReceptor: string = '';
  @Input() tipoPersona: string = '';
  @Input() regimenFiscal: string = '';
  @Input() domicilioFiscal: string = '';

}
