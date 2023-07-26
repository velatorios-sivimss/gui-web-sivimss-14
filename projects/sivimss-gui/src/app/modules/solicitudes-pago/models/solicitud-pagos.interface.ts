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
  fecElaboracion: string;
  ejercicioFiscal: number;
  idDelegacion: number;
  unidadMedica: number;
  idTipoSolicitid: number;
  desEstatusSolicitud: string;
  desVelatorio: string;
  nomBeneficiario: string;
  desTipoSolicitud: string;
  idEstatusSol: number;


  fechaElaboracion1: string;
  nomDestinatario1: string;
  nomRemitente1: string;
  referenciaTD1: string;
  beneficiario1: string;
  concepto1: string;
  importeTotal1: string;
  cantidad1: string;
  observ1: string;

  folioGastos2: string;
  fechaElaboracion2: string;
  unidadOpe2: string;
  unidadAdmi2: string;
  refeUnidadOpe2: string;
  solicitadoOpePor2: string;
  refeUnidadAdmi2: string;
  solicitadoAdmiPor2: string;
  nombreDestinatario2: string;
  nomRemitente2: string;
  referenciaTD2: string;
  beneficiario2: string;
  concepto2: string;
  cantidadLetra2: string;
  observ2: string;

  folioGastos3: string;
  folioConsig3: string;
  unidadOpe3: string;
  fechaElaboracion3: string;
  nombreDestinatario3: string;
  nomRemitente3: string;
  referenciaTD3: string;
  beneficiario3: string;
  concepto3: string;
  cantidadLetra3: string;
  observ3: string;

  folioGastos4: string;
  folioConsig4: string;
  fechaElaboracion4: string;
  nombreDestinatario4: string;
  nomRemitente4: string;
  referenciaTD4: string;
  beneficiario4: string;
  concepto4: string;
  cantidadLetra4: string;
  observ4: string;

}

export interface CrearSolicitudPago {
  idTipoSolic: number;
  cveFolioGastos: string;
  cveFolioConsignados: string;
  fechaElaboracion: string;
  idUnidadMedica: number;
  idDelegacion: number;
  nomDestinatario: string;
  nomRemitente: string;
  numReferencia: number;
  idContratBenef: number;
  fechaInicial: string;
  fechaFinal: string;
  beneficiario: string;
  concepto: string;
  observaciones: string;
  idVelatorio: number;
  ejercicioFiscal: number;
  idEstatusSol: number;
}


export interface PartidaPresupuestal {
  idPartida: number;
  partidaPresupuestal: string;
  cuentasContables: string;
  importeTotal: string;
}
