import {TipoDropdown} from "../../../../models/tipo-dropdown";

export const TIPO_PAGO_CATALOGOS_ODS: TipoDropdown[] = [
  {
    value: 1,
    label: 'Vale paritaria',
  },
  {
    value: 2,
    label: 'Ayuda de Gastos de Funeral (AGF)',
  },
  {
    value: 3,
    label: 'Tarjeta de crédito',
  },
  {
    value: 4,
    label: 'Tarjeta de débito',
  },
  {
    value: 5,
    label: 'Efectivo',
  },
  {
    value: 6,
    label: 'Transferencia',
  },
  {
    value: 7,
    label: 'Deposito',
  },
  {
    value: 8,
    label: 'Traslado oficial',
  }
];


export const TIPO_PAGO_CATALOGOS_CONVENIO: TipoDropdown[] = [
  {
    value: 3,
    label: 'Tarjeta de crédito'
  },
  {
    value: 4,
    label: 'Tarjeta de débito'
  },
  {
    value: 6,
    label: 'Transferencia'
  },
  {
    value: 7,
    label: 'Deposito'
  }
];
