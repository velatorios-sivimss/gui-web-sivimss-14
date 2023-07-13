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
  idOrdenServicio?: number | null;
  idVelatorio?: number;
  idContratante?: number;
  idFinado?: number;
  idTipoODS?: number;
  idUnidadMedica?: number;
  idConvenio?: number | null;
  tipoReporte?: string;
}
