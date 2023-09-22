import {TipoDropdown} from "../../../../models/tipo-dropdown";

export const TIPO_PAGO_CATALOGOS_ODS: any[] = [
  {
    value: 1,
    label: 'Vale paritaria',
    deshabilitado: true
  },
  {
    value: 2,
    label: 'Ayuda de Gastos de Funeral (AGF)',
    deshabilitado: false
  },
  {
    value: 3,
    label: 'Tarjeta crédito',
    deshabilitado: false
  },
  {
    value: 4,
    label: 'Tarjeta débito',
    deshabilitado: false
  },
  {
    value: 5,
    label: 'Efectivo',
    deshabilitado: false
  },
  {
    value: 6,
    label: 'Transferencia',
    deshabilitado: false
  },
  {
    value: 7,
    label: 'Deposito',
    deshabilitado: false
  },
  {
    value: 8,
    label: 'Traslado oficial',
    deshabilitado: false
  }
];


export const TIPO_PAGO_CATALOGOS_CONVENIO: TipoDropdown[] = [
  {
    value: 3,
    label: 'Tarjeta crédito'
  },
  {
    value: 4,
    label: 'Tarjeta débito'
  },
  {
    value: 6,
    label: 'Transferencia'
  },
  {
    value: 7,
    label: 'Deposito'
  }
]


export const BENEFICIARIOS = [
  {
    curp: 'AFERH648903HG00',
    nombre: 'Angel Faraón Morales'
  },
  {
    curp: 'FGGRD234890DF45',
    nombre: 'Fernanda Garcia García'
  },
  {
    curp: 'OFHYF67576PD33F4',
    nombre: 'Karla Lopez Durán'
  },
]
