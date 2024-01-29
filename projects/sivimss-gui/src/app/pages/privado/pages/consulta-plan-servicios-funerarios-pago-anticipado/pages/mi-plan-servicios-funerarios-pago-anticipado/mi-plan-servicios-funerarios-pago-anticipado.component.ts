import { Component, OnInit } from '@angular/core';

interface DetalleServicioFunerario {
  velatorio?: string;
  folioConvenio?: string;
  estatusConvenio?: string;
  tipoPaquete?: string;
  numPagos?: string;
  titular?: {
    curp?: string;
    rfc?: string;
    matricula?: string;
    nss?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    sexo?: string;
    fechaNacimiento?: string;
    nacionalidad?: string;
    paisNacimiento?: string;
    lugarNacimiento?: string;
    telefono?: string;
    correo?: string;
    calle?: string;
    numExterior?: string;
    numInterior?: string;
    cp?: string;
    colonia?: string;
    municipio?: string;
    estado?: string;
  },
  titularSubstituto?: {
    curp?: string;
    rfc?: string;
    matricula?: string;
    nss?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    sexo?: string;
    fechaNacimiento?: string;
    nacionalidad?: string;
    paisNacimiento?: string;
    lugarNacimiento?: string;
    telefono?: string;
    correo?: string;
    calle?: string;
    numExterior?: string;
    numInterior?: string;
    cp?: string;
    colonia?: string;
    municipio?: string;
    estado?: string;
  }
}
@Component({
  selector: 'app-mi-plan-servicios-funerarios-pago-anticipado',
  templateUrl: './mi-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: ['./mi-plan-servicios-funerarios-pago-anticipado.component.scss'],
})
export class MiPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  beneficiarios: any[] = [];
  pagos = [];
  detalleServicioFunerario!: DetalleServicioFunerario;

  ngOnInit(): void { /* TODO document why this method 'ngOnInit' is empty */ }
}