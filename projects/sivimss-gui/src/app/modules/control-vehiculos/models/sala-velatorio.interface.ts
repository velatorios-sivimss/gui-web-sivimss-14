export interface SalaVelatorio {
    idSala?: number,
    nombreSala?: string,
    estadoSala?: "OCUPADA" | "DISPONIBLE" | "MANTENIMIENTO",
    indDisponibilidad?: number
    horaEntrada?: number
    idRegistro?: number
}

export interface SalaVelatorioConsultaDia {
  nombreSala?: string,
  nombreFinado?: string,
  horaEntrada?: any,
  nombreContratante?: string,
  folio?: string,
  idSala?: number,
  horaSalida?: any,
  idRegistro?: number
}
