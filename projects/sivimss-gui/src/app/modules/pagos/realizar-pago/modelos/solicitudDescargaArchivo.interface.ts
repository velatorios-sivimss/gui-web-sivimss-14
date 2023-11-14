export interface SolicitudDescargaArchivo {
  folio: string | null,
  fechaFin: string,
  fechaInicio: string,
  idVelatorio: number,
  nomContratante: string,
  idFlujoPagos: number | null,
  tipoReporte: string
}
