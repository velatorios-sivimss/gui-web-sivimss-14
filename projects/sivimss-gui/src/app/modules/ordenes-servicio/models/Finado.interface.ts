import { CodigoPostalIterface } from './CodigoPostal.interface';

export interface FinadoInterface {
  idPersona: number | null;
  idTipoOrden: number | null;
  extremidad: any | null;
  esobito: string | null;
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
