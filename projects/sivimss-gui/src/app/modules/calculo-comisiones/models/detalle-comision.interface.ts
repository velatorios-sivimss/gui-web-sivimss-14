export interface DetalleComision {
  numEmpleado?: string;
  primerApellido?: string;
  velatorio?: string;
  categoria?: string;
  segundoApellido?: string;
  montoComision?: number;
  nombre?: string;
  puesto?: string;
  correo?: string;
  fecNacimiento?: string;
  fecIngreso?: string;
  sueldoBase?: number;
  idPromotor?: number;
  curp?: string;
  }

  
export interface DetalleODS {
    idValeSalida?: number;
    folioValeSalida?: number;
    idVelatorio?: number;
    nombreVelatorio?: string;
    nombreDelegacion?: string;
    idOds?: number;
    folioOds?: string;
    idContratante?: number;
    nombreContratante?: string;
    idFinado?: number;
    nombreFinado?: string;
    nombreResponsableInstalacion?: string;
    matriculaResponsableInstalacion?: string;
    idResponsableInstalacion?: number;
    idResponsableEntrega?: number;
    matriculaResponsableEntrega?: string;
    nombreResponsableEntrega?: string;
    idResponsableEquipoVelacion?: number;
    matriculaResponsableEquipoVelacion?: string;
    nombreResponsableEquipoVelacion?: string;
    diasNovenario?: string;
    fechaSalida?: string;
    fechaEntrada?: string;
    fechaEntradaTmp?: string;
    cantidadArticulos?: string;
    calle?: string;
    numExt?: string;
    numInt?: string;
    colonia?: string;
    municipio?: string;
    estado?: string;
    cp?: string;
    articulos: Articulo[];
    validacionDias?: number;
  }

  export interface Articulo {
    idValeSalida?: number;
    idInventario?: number;
    nombreArticulo?: string;
    cantidad?: number;
    observaciones?: string;
  }
  