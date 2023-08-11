export interface OrdenServicioPaginado {
  unidadProcedencia?:string;
  numeroFolio?:string;
  estatus?:string;
  nombreFinado?:string;
  velatorio?:string;
  nombreContratante?:string;
  tipoOrden?:string;
  idOrdenServicio:any;
  contratoConvenio?:string;
  tiempoGeneracionODSHrs?: number;
  EntradaDonacion: number | null;
  SalidaDonacion: number | null
}

export interface OrdenServicioFiltroConsulta {
  cveFolio?: number | null;
  idVelatorio?: number;
  idContratante?: number;
  idFinado?: number;
  idTipoODS?: number;
  idUnidadMedica?: number;
  cveConvenio?: string | null;
  numeroFolio?: string;
  tipoReporte?: string;
  nombreFinado?: string | null;
  apPatFinado?: string | null;
  apMatFinado?: string | null;
  nombreContratante?: string | null;
  apPatContratante?: string  | null;
  apMatContratante?: string  | null;
}
