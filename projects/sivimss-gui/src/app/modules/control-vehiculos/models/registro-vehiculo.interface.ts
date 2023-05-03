export interface EntradaVehiculo {
  idSala?: any;
  idOds?: number;
  idTipoOcupacion?: number;
  fechaEntrada?: string;
  horaEntrada?: string;
  cantidadGasInicial?: number;
  descripcionMantenimiento?: string;
  nombreResponsable?: string;
}

export interface SalidaVehiculo {
  idSala?: number,
  fechaSalida?: string,
  horaSalida?: string,
  cantidadGasFinal?: number,
  idRegistro?: number,
}
