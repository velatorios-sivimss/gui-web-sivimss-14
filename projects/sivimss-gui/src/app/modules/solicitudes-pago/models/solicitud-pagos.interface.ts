export interface SolicitudPago {
  idVelatorio: number;
  folio: string;
  ejercFiscal: string,
  fechaElaboracion: string;
  tipoSolic: string;
  estatus: string;
}

export interface SolicitarSolicitudPago {
  tipoSolicitud: string;
  fechaElaboracion1: string;
  nomDestinatario1: string;
  nomRemitente1: string;
  referenciaTD1: string;
  beneficiario1: string;
  concepto1: string;
  importeTotal1: string;
  cantidad1: string;
  observ1: string;

  folioFiscal2: string;
  fechaElaboracion2: string;
  nombreDestinatario2: string;
  nomRemitente2: string;
  referenciaTD2: string;
  beneficiario2: string;
  concepto2: string;
  cantidadLetra2: string;
  observ2: string;

  unidadOpe3: string;
  folioFiscal3: string;
  fechaElaboracion3: string;
  nombreDestinatario3: string;
  nomRemitente3: string;
  referenciaTD3: string;
  beneficiario3: string;
  concepto3: string;
  cantidadLetra3: string;
  observ3: string;
}


export interface CancelarSolicitudPago {
  motivo: string;
}

export interface RechazarSolicitudPago {
  motivoRechazo: string;
}

