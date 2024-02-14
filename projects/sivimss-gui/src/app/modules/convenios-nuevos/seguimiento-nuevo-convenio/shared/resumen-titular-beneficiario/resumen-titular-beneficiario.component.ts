import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-resumen-titular-beneficiario',
  templateUrl: './resumen-titular-beneficiario.component.html',
  styleUrls: ['./resumen-titular-beneficiario.component.scss']
})
export class ResumenTitularBeneficiarioComponent implements OnInit {
  @Input() matricula: string = 'Sin Información';
  @Input() rfc: string = 'Sin Información';
  @Input() curp: string = 'Sin Información';
  @Input() nombre: string = 'Sin Información';
  @Input() nss: string = 'Sin Información';
  @Input() sexo: string = 'Sin Información';
  @Input() otroSexo: string = 'Sin Información';
  @Input() fechaNacimiento: string = 'Sin Información';
  @Input() primerApellido: string = 'Sin Información';
  @Input() segundoApellido: string = 'Sin Información';
  @Input() calle: string = 'Sin Información';
  @Input() numeroExterior: string = 'Sin Información';
  @Input() numeroInterior: string = 'Sin Información';
  @Input() codigoPostal: string = 'Sin Información';
  @Input() colonia: string = 'Sin Información';
  @Input() municipio: string = 'Sin Información';
  @Input() estado: string = 'Sin Información';
  @Input() nacionalidad: string = 'Sin Información';
  @Input() paisNacimiento: string = 'Sin Información';
  @Input() lugarNacimiento: string = 'Sin Información';
  @Input() correoElectronico: string = 'Sin Información';
  @Input() telefono: string = 'Sin Información';
  @Input() telefonoFijo: string = 'Sin Información';
  @Input() telefonoCelular: string = 'Sin Información';
  @Input() tipoPaquete: string = 'Sin Información';
  @Input() numeroPagos: string = 'Sin Información';
  @Input() titular: 'titular' | 'beneficiario' = 'titular';

  constructor() { }

  ngOnInit(): void {
  }

}
