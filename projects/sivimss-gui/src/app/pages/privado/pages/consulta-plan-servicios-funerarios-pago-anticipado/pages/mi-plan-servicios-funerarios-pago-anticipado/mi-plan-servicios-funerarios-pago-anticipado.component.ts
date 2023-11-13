import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mi-plan-servicios-funerarios-pago-anticipado',
  templateUrl: './mi-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: ['./mi-plan-servicios-funerarios-pago-anticipado.component.scss'],
})
export class MiPlanServiciosFunerariosPagoAnticipadoComponent
  implements OnInit
{
  registros: any[] = [
    {
      rfc: 'RFC1',
      fechaNacimiento: '1990-01-01',
      nombreCompleto: 'Nombre Apellido1 Apellido2',
      telefono: '555-555-5555',
      calle: 'Calle 1',
      noExt: '123',
      noInt: 'A',
      codigoPostal: '12345',
      colonia: 'Colonia 1',
      municipio: 'Municipio 1',
      estado: 'Estado 1',
    },
    {
      rfc: 'RFC2',
      fechaNacimiento: '1995-02-02',
      nombreCompleto: 'Nombre Apellido3 Apellido4',
      telefono: '555-555-5556',
      calle: 'Calle 2',
      noExt: '456',
      noInt: 'B',
      codigoPostal: '54321',
      colonia: 'Colonia 2',
      municipio: 'Municipio 2',
      estado: 'Estado 2',
    },
    {
      rfc: 'RFC3',
      fechaNacimiento: '1985-03-03',
      nombreCompleto: 'Nombre Apellido5 Apellido6',
      telefono: '555-555-5557',
      calle: 'Calle 3',
      noExt: '789',
      noInt: 'C',
      codigoPostal: '67890',
      colonia: 'Colonia 3',
      municipio: 'Municipio 3',
      estado: 'Estado 3',
    },
  ];

  registros2 = [
    {
      pago: "Pago 1",
      fechaPago: "2023-01-01",
      monto: 100.50,
      metodoPago: "Tarjeta de crédito",
      estatus: "Aprobado",
      noReciboPago: "R-001"
    },
    {
      pago: "Pago 2",
      fechaPago: "2023-02-02",
      monto: 75.25,
      metodoPago: "Transferencia bancaria",
      estatus: "Rechazado",
      noReciboPago: "R-002"
    },
    {
      pago: "Pago 3",
      fechaPago: "2023-03-03",
      monto: 50.00,
      metodoPago: "Efectivo",
      estatus: "Pendiente",
      noReciboPago: "R-003"
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
