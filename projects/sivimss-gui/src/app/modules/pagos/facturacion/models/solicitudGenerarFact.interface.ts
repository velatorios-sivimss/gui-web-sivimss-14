import {DatoFiscal} from "./registroRFC.interface";

export interface SolicitudGenerarFact {
  tipoFactura: string,
  folio: string,
  idPagoBitacora: number,
  idRegistro: number,
  nomContratante: string,
  idVelatorio: number,
  totalPagado: string,
  totalServicios: string,
  servicios: ServiciosContratados[],
  rfc: string,
  correo: string,
  razonSocial: string,
  tipoPersona: string,
  regimenFiscal: string,
  domicilioFiscal: DatoFiscal,
  cfdi: {
    desCfdi: string,
    idCfdi: number
  },
  metPagoFac: {
    desMetPagoFac: string,
    idMetPagoFac: number
  },
  forPago: {
    desForPago: string,
    idForPago: number
  },
  obsAutomatica: string,
  obsManual: string
}

interface ServiciosContratados {
  grupo: string,
  concepto: string,
  cantidad: string,
  claveSat: string,
  importe: string,
  total: string
}
