import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-resumen-empresa',
  templateUrl: './resumen-empresa.component.html',
  styleUrls: ['./resumen-empresa.component.scss']
})
export class ResumenEmpresaComponent implements OnInit {
  @Input() nombre: string = 'Sin Información'
  @Input() razonSocial: string = 'Sin Información'
  @Input() rfc: string = 'Sin Información'
  @Input() pais: string = 'Sin Información'
  @Input() codigoPostal: string = 'Sin Información'
  @Input() colonia: string = 'Sin Información'
  @Input() estado: string = 'Sin Información'
  @Input() municipio: string = 'Sin Información'
  @Input() calle: string = 'Sin Información'
  @Input() numeroExterior: string = 'Sin Información'
  @Input() numeroInterior: string = 'Sin Información'
  @Input() telefono: string = 'Sin Información'
  @Input() correoElectronico: string = 'Sin Información'

  constructor() { }

  ngOnInit(): void {
  }

}
