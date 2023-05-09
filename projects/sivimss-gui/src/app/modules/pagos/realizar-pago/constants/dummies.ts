import {TipoDropdown} from "../../../../models/tipo-dropdown";

export const REGISTROS_PAGOS = [
  {
    fecha: '10/08/2021',
    folio: 'DOC-000001',
    nombreContratante: 'Heriberto Angelo Sanchez Maldonado',
    tipoPago: 'Pago de Orden de Servicio',
    total: '$25000',
    estatus: 'Generada'
  },
  {
    fecha: '10/08/2021',
    folio: 'DOC-000001',
    nombreContratante: 'Heriberto Angelo Sanchez Maldonado',
    tipoPago: 'Pago de Orden de Servicio',
    total: '$25000',
    estatus: 'Vigente'
  },
  {
    fecha: '10/08/2021',
    folio: 'DOC-000001',
    nombreContratante: 'Heriberto Angelo Sanchez Maldonado',
    tipoPago: 'Pago de Orden de Servicio',
    total: '$25000',
    estatus: 'Pagada'
  },
  {
    fecha: '10/08/2021',
    folio: 'DOC-000001',
    nombreContratante: 'Heriberto Angelo Sanchez Maldonado',
    tipoPago: 'Pago de Orden de Servicio',
    total: '$25000',
    estatus: 'Cancelada'
  },
  {
    fecha: '10/08/2021',
    folio: 'DOC-000001',
    nombreContratante: 'Heriberto Angelo Sanchez Maldonado',
    tipoPago: 'Pago de Orden de Servicio',
    total: '$25000',
    estatus: 'Generada'
  },
];

export const REGISTROS_PAGOS_ODS = [
  {
    fechaPago: '10/08/2021',
    folioODS: 'DOC-000001',
    tipoPago: 'Pago de Orden de Servicio',
    totalPagar: '$25000',
    totalPagado: '$10000',
    diferenciasTotales: '$15000'
  },
  {
    fechaPago: '10/08/2021',
    folioODS: 'DOC-000001',
    tipoPago: 'Pago de Orden de Servicio',
    totalPagar: '$25000',
    totalPagado: '$10000',
    diferenciasTotales: '$15000'
  },
  {
    fechaPago: '10/08/2021',
    folioODS: 'DOC-000001',
    tipoPago: 'Pago de Orden de Servicio',
    totalPagar: '$25000',
    totalPagado: '$10000',
    diferenciasTotales: '$15000'
  },
  {
    fechaPago: '10/08/2021',
    folioODS: 'DOC-000001',
    tipoPago: 'Pago de Orden de Servicio',
    totalPagar: '$25000',
    totalPagado: '$10000',
    diferenciasTotales: '$15000'
  },
  {
    fechaPago: '10/08/2021',
    folioODS: 'DOC-000001',
    tipoPago: 'Pago de Orden de Servicio',
    totalPagar: '$25000',
    totalPagado: '$10000',
    diferenciasTotales: '$15000'
  },
];

export const TIPO_PAGO_CATALOGOS_ODS: TipoDropdown[] = [
  {
    value: 1,
    label: 'Vale paritaria'
  },
  {
    value: 2,
    label: 'Ayuda de gastos de funeral (AGF)'
  },
  {
    value: 3,
    label: 'Tarjeta credito'
  },
  {
    value: 4,
    label: 'Tarjeta debito'
  },
  {
    value: 5,
    label: 'Efectivo'
  },
  {
    value: 6,
    label: 'Transferencia'
  },
  {
    value: 7,
    label: 'Deposito'
  },
  {
    value: 8,
    label: 'Traslado oficial'
  }
];


export const TIPO_PAGO_CATALOGOS_CONVENIO: TipoDropdown[] = [
  {
    value: 1,
    label: 'Tarjeta credito'
  },
  {
    value: 2,
    label: 'Tarjeta debito'
  },
  {
    value: 3,
    label: 'Transferencia'
  },
  {
    value: 4,
    label: 'Deposito'
  }
]
