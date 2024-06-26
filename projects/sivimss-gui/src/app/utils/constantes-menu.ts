export interface DatoModulo {
  [val: string]: {
    icono?: string;
    ruta?: string;
  }
}

/**
 * Cada número representa el id de algún módulo.
 * La ruta es absoluta y debe coincidir con la del app-routing
 * El icono debe estar en assets/images/menu/[nombre-en-minusculas.svg]
 */
export const idsModulos: DatoModulo = {
  '1': {
    ruta: '',
    icono: 'operacion-sivimss.svg'
  },
  '2': {
    ruta: '/usuarios',
    icono: 'default-icon.svg'
  },
  '3': {
    ruta: '/roles-permisos',
    icono: 'default-icon.svg',
  },
  '4': {
    ruta: '/roles',
    icono: 'default-icon.svg',
  },
  '5': {
    ruta: '/capillas',
    icono: 'default-icon.svg'
  },
  '6': {
    ruta: '/articulos',
    icono: 'default-icon.svg'
  },
  '7': {
    ruta: '/servicios',
    icono: 'default-icon.svg'
  },
  '8': {
    ruta: '/velatorios',
    icono: 'default-icon.svg'
  },
  '9': {
    ruta: 'reservar-salas',
    icono: 'reservar-salas.svg'
  },
  '10': {
    ruta: '/proveedores',
    icono: 'default-icon.svg'
  },
  '11': {
    ruta: '/contratantes',
    icono: 'default-icon.svg'
  },
  '12': {
    ruta: '',
    icono: 'ods.svg'
  },
  '13': {
    ruta: 'ordenes-de-servicio',
    icono: 'default-icon.svg'
  },
  '14': {
    ruta: '/inventario-interno',
    icono: 'default-icon.svg'
  },
  '15': {
    ruta: '',
    icono: 'convenios-prev-funeraria.svg'
  },
  '16': {
    ruta: 'convenios-prevision-funeraria',
    icono: 'default-icon.svg'
  },
  '17': {
    ruta: 'convenios-prevision-funeraria/ingresar-nuevo-convenio',
    icono: 'default-icon.svg'
  },
  '18': {
    ruta: 'ordenes-de-servicio/generar-orden-de-servicio',
    icono: 'default-icon.svg'
  },
  '19': {
    ruta: '/salas',
    icono: 'default-icon.svg'
  },
  '20': {
    ruta: '',
    icono: 'operacion-sivimss.svg'
  },
  '21': {
    ruta: '/salas',
    icono: 'default-icon.svg'
  },
  '22': {
    ruta: '/reservar-capilla',
    icono: 'default-icon.svg'
  },
  '23': {
    ruta: '/programar-mantenimiento-vehicular',
    icono: 'programa-mtto-vehicular.svg'
  },
  '24': {
    ruta: '/reservar-capilla/velacion-en-domicilio',
    icono: 'default-icon.svg'
  },
  '25': {
    ruta: '/control-de-vehiculos',
    icono: 'eleccion-vehiculo.svg'
  },
  '26': {
    ruta: '',
    icono: 'reservar-capilla.svg'
  },
  '36': {
    ruta: '',
    icono: 'pagos.svg'
  },
  '37': {
    ruta: '/generar-orden-de-subrogacion',
    icono: 'default-icon.svg'
  },
  '64': {
    ruta: '/consulta-donaciones',
    icono: 'default-icon.svg'
  },
  '65': {
    ruta: '/pagos/generar-recibo-pago',
    icono: 'default-icon.svg'
  },
  '66': {
    ruta: '/generar-nota-remision',
    icono: 'generar-nota-remision.svg'
  },
  '69': {
    ruta: '/balance-cajas',
    icono: 'default-icon.svg'
  },
  '70': {
    ruta: '/gestionar-tramites',
    icono: 'default-icon.svg'
  },
  '102': {
    ruta: '/pagos/generar-formato-pagare',
    icono: 'default-icon.svg'
  },
  '136': {
    ruta: '/pagos/realizar-pago',
    icono: 'default-icon.svg'
  },
  '165': {
    ruta: '/solicitudes-pago',
    icono: 'default-icon.svg'
  },
  '166': {
    ruta: '/pagos/gestionar-pago',
    icono: 'default-icon.svg'
  },
  '29': {
    ruta: '/registro-otorgamiento-servicios',
    icono: 'default-icon.svg'
  },
  '30': {
    ruta: '',
    icono: 'default-icon.svg'
  },
  '31': {
    ruta: '/servicios-funerarios/registrar-nuevo-plan-sfpa',
    icono: 'default-icon.svg'
  },
  '32': {
    ruta: '/servicios-funerarios',
    icono: 'default-icon.svg'
  },
  '129': {
    ruta: 'convenios-prevision-funeraria/renovar-convenio-pf',
    icono: 'default-icon.svg'
  },
  '71': {
    ruta: 'convenios-prevision-funeraria/renovacion-extemporanea',
    icono: 'default-icon.svg'
  },
  '115': {
    ruta: '/promotores',
    icono: 'default-icon.svg'
  },
  '76': {
    ruta: 'ordenes-de-servicio/generar-ods-sf',
    icono: 'default-icon.svg'
  },
  '75': {
    ruta: '/generar-formato-de-actividades',
    icono: 'generar-formato-actividades.svg'
  },
  '77': {
    ruta: '',
    icono: 'default-icon.svg'
  },
  '78': {
    ruta: 'orden-entrada',
    icono: 'default-icon.svg'
  },
  '79': {
    ruta: 'generar-orden-de-subrogacion',
    icono: 'default-icon.svg'
  },
  '265': {
    ruta: 'reportes',
    icono: 'default-icon.svg'
  },
  '39': {
    ruta: '/generar-hoja-de-consignacion',
    icono: 'generar-hoja-consignacion.svg'
  },
  '47': {
    ruta: 'comisiones',
    icono: 'default-icon.svg'
  }
};
