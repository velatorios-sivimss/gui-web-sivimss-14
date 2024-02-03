import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-resumen-documentacion-beneficiario',
  templateUrl: './resumen-documentacion-beneficiario.component.html',
  styleUrls: ['./resumen-documentacion-beneficiario.component.scss']
})
export class ResumenDocumentacionBeneficiarioComponent implements OnInit {
  @Input() numeroDocumento: string = 'Sin Información'
  @Input() tipoDocumento: string = 'Sin Información'
  @Input() nombreDocumento: string = 'Sin Información'

  constructor() { }

  ngOnInit(): void {
  }

}
