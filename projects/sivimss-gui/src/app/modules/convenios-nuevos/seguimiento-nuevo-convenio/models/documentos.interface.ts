export interface Documentos {
  id?:number;
  nombre?: string;
  apellidoMaterno?: string;
  ApellidoPaterno?: string;
  nombreDocumento?: string;
  numeroDocumento?: number;
  tipoDocumento?: string;
  linkDocumento?: string;
  }

  export interface ConfirmacionServicio {
    estatus?: boolean;
    origen?: string;
  }

