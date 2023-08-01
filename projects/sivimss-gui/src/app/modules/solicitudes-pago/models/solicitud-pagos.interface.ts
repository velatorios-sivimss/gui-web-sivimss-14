export interface SolicitudPago {
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
}

export interface DetalleSolicitudPago {
  idSolicitud: number;
  cveFolioGastos: string;
  desEstatusSolicitud: string;
  desTipoSolicitud: string;
  fecElaboracion: string;
  ejercicioFiscal: number;
  idDelegacion: number;
  unidadMedica: number;
  unidadAdmi: number;
  idTipoSolicitud: number;
  desVelatorio  : string;
  idEstatusSol: number;
  idUnidadOperativa: number;
  idVelatorio: number;
  nomBeneficiario : string;
  importeTotal: string;

  refeUnidadOpe: string;
  solicitadoPor  : string;
  nomDestinatario: string;
  nomRemitente: string;
  referenciaTD: string;
  beneficiario: string;
  fehaInicial: string;
  fechaFinal: string;
  banco: string;
  cuenta: string;
  claveBancaria: string;
  concepto: string;
  cantidadLetra: string;
  numContrato: string;
  observ: string;

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
  idProveedor: number
}


export interface PartidaPresupuestal {
  idPartida: number;
  partidaPres: string;
  cuentaContable: string;
  importeTotal: string;
}
