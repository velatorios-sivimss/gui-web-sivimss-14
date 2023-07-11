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
}


export interface CancelarSolicitudPago {
  motivo: string;
}

export interface RechazarSolicitudPago {
  motivoRechazo: string;
}

