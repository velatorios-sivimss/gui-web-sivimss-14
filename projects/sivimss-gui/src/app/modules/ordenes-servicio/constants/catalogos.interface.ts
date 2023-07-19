export interface catalogoVelatorio{
    idVelatorio?: number;
  DES_VELATORIO?: string;
}

export interface catalogoFolioODS{
  folioODS?: string;
  idODS?: number;
}

export interface catalogoTipoODS{
  idTipoODS?: number;
  tipoODS?: string;
}

export interface catalogoUnidadesMedicas {
  idUnidadMedica?:number;
  nombreUnidad?:string;
}

export interface catalogoContratantes {
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
}

export interface catalogoFinado {
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
}

export interface CatalogoOperadores {
  idOperador?: number;
  nombreOperador?: string;
}
