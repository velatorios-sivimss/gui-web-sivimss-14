export interface CatalogoVelatorio {
  idVelatorio?: number;
  DES_VELATORIO?: string;
}

export interface CatalogoFolioODS {
  folioODS?: string;
  idODS?: number;
}

export interface CatalogoTipoODS {
  idTipoODS?: number;
  tipoODS?: string;
}

export interface CatalogoUnidadesMedicas {
  idUnidadMedica?: number;
  nombreUnidad?: string;
}

export interface CatalogoContratantes {
  primerApellido?: string;
  numInterior?: string;
  fechaNacimiento?: string;
  calle?: string;
  numExterior?: string;
  segundoApellido?: string;
  cp?: number;
  nombreCompletoContratante?: string;
  rfc?: string;
  nacionalidad?: string;
  pais?: string;
  idContratante?: string;
  nombreContratante?: string;
  parentesco?: string;
  matricula?: string;
  sexo?: string;
  telefono?: string;
  lugarNacimiento?: string;
  correoElectronico?: string;
  curp?: string;
  nomContratante?: string,
  apPatContratante?: string,
  apMatContratante?: string
}

export interface CatalogoFinado {
  idFinado?: number;
  numInterior?: string;
  fechaDefuncion?: string;
  fechaNacimiento?: string;
  segundoApellido?: string;
  servicioExtremidad?: string;
  nss?: string;
  nombres?: string;
  nacionalidad?: string;
  clinicaAdscripcion?: string;
  velatorioPrevisionsp?: string;
  pension?: string;
  paisNacimiento?: string;
  curp?: string;
  horaDeceso?: string;
  unidadProcedencia?: string;
  primerApellido?: string;
  tipoOrden?: string;
  calle?: string;
  numExterior?: string;
  nombreCompletoFinado?: string;
  contratoConvenio?: string;
  edad?: number;
  cp?: number;
  colonia?: string;
  procedenciaFinado?: string;
  matricula?: string;
  esObito?: string;
  lugarDeceso?: string;
  sexo?: string;
  lugarNacimiento?: string;
  nomContratante?: string,
  apPatContratante?: string,
  apMatContratante?: string
}

export interface CatalogoOperadores {
  idOperador?: number;
  nombreOperador?: string;
}
