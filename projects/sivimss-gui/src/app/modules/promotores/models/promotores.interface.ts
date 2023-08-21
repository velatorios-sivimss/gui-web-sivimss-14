export interface Promotor {
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  velatorio?: string;
  antiguedad?: string;
  diasDescanso?: string;
  nombrePromotor?: string;
  descripcion?: string;
  curp?: string;
  nomPromotor?: string;
  aPaterno?: string;
  aMaterno?: string;
  fecNac?: string;
  correo?: string;
  numEmpleado?: string;
  puesto?: string;
  categoria?: string;
  fecIngreso?: string;
  fecBaja?: string;
  sueldoBase?: number;
  idVelatorio?: number;
  idPromotor?: number;
  estatus?: boolean;
  fecPromotorDiasDescanso?: string[]
  promotorDiasDescanso?: string[]
}

export interface PromotoresBusqueda {
  numEmpleado?: string;
  primerApellido?: string;
  velatorio?: string;
  fecNac?: string;
  categoria?: string;
  segundoApellido?: string;
  nombre?: string;
  puesto?: string;
  estatus: true,
  diasDescanso?: number;
  correo?: string;
  fecIngreso?: string;
  sueldoBase?: number;
  fecBaja?: string;
  idPromotor?: number;
  curp?: string;
  antiguedad?: string;
}

export interface BuscarPromotores {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  nomPromotor?: string | null;
}

export interface CambiarEstatus {
  idPromotor?: number;
  estatus?: number;
}

export interface BuscarCatalogo {
  idDelegacion?: number | null;
  idVelatorio?: number | null;
  nomPromotor?: string | null;
  catalogo?: number | null;
}