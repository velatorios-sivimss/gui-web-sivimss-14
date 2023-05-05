export interface BuscarVehiculosDisponibles {
  idVelatorio?: number,
  fecIniRepo?: string | null,
  fecFinRepo?: string | null,
}

export interface ControlVehiculoListado {
  idVehiculo: number,
  disponible: number,
  descripcion: string,
  fecha?: string,
}

export interface ControlVehiculoConsulta {
  marca: string,
  nombreDestino: string,
  idVehiculo: string,
  nombreFinado: string,
  nombreContratante: string,
  folioODS: string,
  idODS: number,
  tarjetaCirculacion: string,
  modelo: string,
  placas: string,
  disponibilidad: number,
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
