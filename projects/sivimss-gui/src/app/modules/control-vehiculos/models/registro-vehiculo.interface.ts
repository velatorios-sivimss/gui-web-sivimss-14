export interface EntradaVehiculo {
  idVehiculo: number;
  idODS: number;
  fecEntrada: string;
  horaEntrada: string;
  gasolinaFinal: string;
  kmFinal: number;
}

export interface SalidaVehiculo {
  idSala?: number,
  fechaSalida?: string,
  horaSalida?: string,
  cantidadGasFinal?: number,
  idRegistro?: number,
}
