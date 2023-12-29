export interface SolicitudDescargaArchivo {
  folio: string | null,
  fechaFin: string | null,
  fechaInicio: string | null,
  idVelatorio: number,
  nomContratante: string,
  idFlujoPagos: number | null,
  tipoReporte: string
}
