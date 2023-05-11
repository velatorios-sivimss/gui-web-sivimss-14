export interface CalendarioVehiculos {
  id?: number;
  title?: string;
  date?: string;
  textColor?: string;
  color?: string;
  borderColor?: string;
  start?: string;
}

export interface FiltroFormData {
  delegacion?: number;
  velatorio?: number;
}

export interface ControlVehiculoConsultaDia {
  nombreSala?: string,
  nombreFinado?: string,
  nombreContratante?: string,
  folio?: string,
  idSala?: number,
  idRegistro?: number,
  horaSalida?: string,
  horaEntrada?: string,
  fechaSalida?: string,
  nivelGasolinaFinal?: string,
  kilometrajeFinal?: string,
  marca: string,
  nombreDestino: string,
  idVehiculo: string,
  folioODS: string,
  idODS: number,
  tarjetaCirculacion: string,
  modelo: string,
  placas: string,
  disponibilidad: number,
}
