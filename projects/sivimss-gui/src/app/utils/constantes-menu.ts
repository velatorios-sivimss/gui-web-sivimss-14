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
    icono: '',
    ruta: ''
  },
  '10': {
    ruta: '/proveedores',
    icono: ''
  },
  '11': {
    ruta: '/contratantes',
    icono: ''
  },
  '14': {
    ruta: '/inventario-interno',
    icono: ''
  },
  '19': {
    ruta: '/salas',
    icono: ''
  },
  '70': {
    ruta: '/gestionar-tramites',
    icono: ''
  }
};







