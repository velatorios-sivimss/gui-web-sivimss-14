export interface RegistrarEntrada {
  idVelatorio?: number;
  fechaEntrada?: string;
  horaEntrada?: string;
  registroEntrada?: string;
  nombreFinado?: string;
  nombreContratante?: string;
  folioODS?: string;
  idCapilla?:number;
  idOrdenServicio?:number;

}

export interface RegistrarSalida {
  idCapilla?:number;
  idOrdenServicio?:number;
  idDisponibilidad?:number;
  fechaSalida?:string;
  horaSalida?:string;
  idVelatorio?: number;
  nomCapilla?: string;
  horaEntrada?: string;
  fechaEntrada?: string;
  fecha?: {fecha?: string, hora?: string}
}


export interface CalendarioCapillas {
  id?: number
  title?: string;
  date?: string;
  textColor?: string;
  color?: string;
  borderColor?: string;
  start?: string;
}

export interface DetalleDiaSeleccionado {
  finado?: string;
  folioOds?: string;
  idOds?: number;
  nomCapilla?: string;
  nombreContratante?: string;
  registroEntrada?: string;
  registroSalida?: string;
}
