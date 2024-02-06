import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-resumen-beneficiario',
  templateUrl: './resumen-beneficiario.component.html',
  styleUrls: ['./resumen-beneficiario.component.scss']
})
export class ResumenBeneficiarioComponent implements OnInit {
  @Input() nombre: string = 'Sin Información';
  @Input() edad: number = 0;
  @Input() parentesco: string = 'Sin Información';
  @Input() curp: string = 'Sin Información';
  @Input() rfc: string = 'Sin Información';
  @Input() correoElectronico: string = 'Sin Información';
  @Input() telefono: string = 'Sin Información';

  constructor() { }

  ngOnInit(): void {
  }

}
