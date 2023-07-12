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
    icono: ''
  },
  '3': {
    ruta: '/roles-permisos',
    icono: '',
  },
  '4': {
    ruta: '/roles',
    icono: '',
  },
  '5': {
    ruta: '/capillas',
    icono: ''
  },
  '6': {
    ruta: '/articulos',
    icono: ''
  },
  '7': {
    ruta: '/servicios',
    icono: ''
  },
  '8': {
    ruta: '/velatorios',
    icono: ''
  },
  '9': {
    ruta: 'reservar-salas',
    icono: ''
  },
  '10': {
    ruta: '/proveedores',
    icono: ''
  },
  '11': {
    ruta: '/contratantes',
    icono: ''
  },
  '12': {
    ruta: '',
    icono: 'default-icon.svg'
  },
  '13': {
    ruta: 'ordenes-de-servicio',
    icono: 'default-icon.svg'
  },
  '14': {
    ruta: '/inventario-interno',
    icono: ''
  },
  '15': {
    ruta: '',
    icono: 'default-icon.svg'
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
    icono: ''
  },
  '20': {
    ruta: '',
    icono: 'operacion-sivimss.svg'
  },
  '21': {
    ruta: '/salas',
    icono: ''
  },
  '22': {
    ruta: '/reservar-capilla',
    icono: ''
  },
  '23': {
    ruta: '/programar-mantenimiento-vehicular',
    icono: ''
  },
  '24': {
    ruta: '/reservar-capilla/velacion-en-domicilio',
    icono: ''
  },
  '25': {
    ruta: '/control-de-vehiculos',
    icono: ''
  },
  '26': {
    ruta: '',
    icono: 'default-icon.svg'
  },
  '36': {
    ruta: '',
    icono: 'pagos.svg'
  },
  '64': {
    ruta: '/consulta-donaciones',
    icono: ''
  },
  '65': {
    ruta: '/pagos/generar-recibo-pago',
    icono: ''
  },
  '66': {
    ruta: '/generar-nota-remision',
    icono: ''
  },
  '70': {
    ruta: '/gestionar-tramites',
    icono: ''
  },
  '102': {
    ruta: '/pagos/generar-formato-pagare',
    icono: ''
  },
};







