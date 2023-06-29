export interface DetalleComisionInterface {
    nombreVelatorio?: string;
    folioOds?: string;
    nombreContratante?: string;
    fechaSalida?: string;
    fechaEntrada?: string;
    responsableInstalacion?: string;
    totalArticulos?: number;
    idEstatus?: number;
    idOds?: number;
    idVelatorio?: number;
    idValeSalida?: number;
    nombreResponsableInstalacion?: string;
    validacionDias?: number;
  }

  
export interface DatosFolioODS {
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
  