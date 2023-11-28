export interface SolicitudPago {
  idUnidadOperartiva: number | null;
  motRechazo?: string;
  desEstatusSolicitud: string;
  idSolicitud: number;
  desVelatorio: string;
  cveFolio: string;
  ejercicioFiscal: string,
  fecElaboracion: string;
  idTipoSolicitid: string;
  desTipoSolicitud: string;
  idEstatus: string;
  idVelatorio: number | null;
  importe: number;
}

export interface DetalleSolicitudPago {
  idSolicitud: number;
  refeUnidadOpe: string;
  desEstatusSolicitud: string;
  desTipoSolicitud: string;
  fecElabora: string;
  idTipoSolicitud: number;
  desVelatorio: string;
  idEstatusSol: number;
  idVelatorio: number;
  nomBeneficiario: string;
  impTotal: string;
  idProveedor: number;
  nomDestinatario: string;
  nomRemitente: string;
  referenciaTD: string;
  banco: string;
  cuenta: string;
  claveBancaria: string;
  concepto: string;
  numContrato: string;
  observaciones: string;
  folioSolicitud: string;
  nomUnidadOpe: string;
  nomResponsable: string;
  cveFolioGastos: string;
  fechaInicial: string;
  fechaFinal: string;
  ejercicioFiscal: number;
  idDelegacion: number;
  idUnidadOperativa: number;
  refUnidadOpe: string;
  solicitadoPor: string;
  cantidadLetra: string;
  beneficiario?: string;
  foliosFactura: string;
}

export interface CrearSolicitudPago {
  idTipoSolic: number,
  cveFolioGastos: string | null,
  cveFolioConsignados: string | null,
  idUnidadOperativa: number | null,
  nomDestinatario: string,
  nomRemitente: string,
  numReferencia: number,
  idContratBenef: number | null,
  fechaElabora: string,
  fechaInicial: string,
  fechaFinal: string,
  concepto: string,
  observaciones: string,
  idVelatorio: number | null,
  ejercicioFiscal: number | null,
  impTotal: number,
  idEstatusSol: number,
  idProveedor: number,
  beneficiario: string | null
}


export interface PartidaPresupuestal {
  idPartida: number | string;
  partidaPres: string;
  cuentaContable: string;
  importeTotal: string;
}
