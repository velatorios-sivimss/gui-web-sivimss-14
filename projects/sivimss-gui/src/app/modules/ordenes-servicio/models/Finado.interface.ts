import { CodigoPostalIterface } from './CodigoPostal.interface';

export interface FinadoInterface {
  idPersona: number | null;
  idTipoOrden: number | null;
  extremidad: any;
  esobito: any;
  matricula: string | null;
  rfc: string | null;
  curp: string | null;
  nss: string | null;
  nomPersona: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  sexo: string | null;
  otroSexo: string | null;
  fechaNac: string | null;
  idPais: string | null;
  idEstado: string | null;
  cp: CodigoPostalIterface | null;
  fechaDeceso: string | null;
  causaDeceso: string | null;
  lugarDeceso: string | null;
  hora: string | null;
  idClinicaAdscripcion: number | null;
  idUnidadProcedencia: number | null;
  procedenciaFinado: string | null;
  idTipoPension: number | null;
  idContratoPrevision: number | null;
  idVelatorioContratoPrevision: number | null;
  idFinado: number | null;
}
export interface FinadoSFInterface {
  cp: CodigoPostalIterface | null;
  idTipoOrden: number | null;
  curp: string | null;
  nss: string | null;
  nomPersona: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  sexo: string | null;
  otroSexo: string | null;
  fechaNac: string | null;
  idPais: string | null;
  idEstado: string | null;
  fechaDeceso: string | null;
  causaDeceso: string | null;
  lugarDeceso: string | null;
  hora: string | null;
  idClinicaAdscripcion: number | null;
  idUnidadProcedencia: number | null;
  procedenciaFinado: string | null;
  idTipoPension: number | null;
  idContratoPrevision: number | null;
  idVelatorioContratoPrevision: number | null;
  idPersona: number | null;
  matricula: string | null;
  rfc: string | null;
}
