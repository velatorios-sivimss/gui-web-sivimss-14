export interface EntradaVehiculo {
  idVehiculo: number;
  idODS: number;
  fecEntrada: string;
  horaEntrada: string;
  gasolinaFinal: string;
  kmFinal: number;
}

export interface SalidaVehiculo {
  idVehiculo?: number,
  idODS?: number,
  fecSalida?: string,
  horaSalida?: string,
  gasolinaInicial?: string,
  kmInicial?: number,
  idResponsable?: number,
}
