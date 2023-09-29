export interface Notificacion {
  path?: string;
  idRegistro?: number;
  indTipoSala?: boolean;
  usoSala?: string;
  idSala?: number;
  nombreSala?: string;

  mensaje?: string;
  botones: any
  cu?: string;
}




export interface Boton {
  path?: string;
  textoBoton?: string;
  data?: {
    sala: DatoSala;
  }
}

export interface DatoSala {
  nombreSala?: string;
  idSala?: string;
  indTipoSala?: string;
  usoSala?: string;
  idRegistro?: number;
}
