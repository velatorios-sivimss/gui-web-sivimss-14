export interface PlantillaAceptarDonacion {
  numContrato?: string,
  nomAdministrador?: string,
  claveAdministrador?: string,
  claveResponsableAlmacen?: string,
  lugar?: string,
  version?:number,
  velatorioId?:number,
  ooadId?:number,
  nomFinado?:string,
  nomResponsableAlmacen?:string,
  nomContratante?: string,
  dia?: number,
  mes?: string,
  anio?:number,
  tipoReporte?:string
  modeloAtaud?:string,
  tipoAtaud?: string,
  numInventarios?: string,
  ooadNom?: string
}


export interface PlantillaControlSalida {
  nomSolicitantes?: string,
  nomAdministrador?: string,
  claveAdministrador?: string,
  lugar?: string,
  claveResponsableAlmacen?: string,


  version?: number,
  ooadNom?: string,
  velatorioId?: number,
  velatorioNom?: string,
  numAtaudes?: number,
  modeloAtaud?: string,
  tipoAtaud?: string,
  numInventarios?: string,
  nomFinados?: string,
  fecSolicitud?: string,
  nomResponsableAlmacen?: string,
  nomSolicitante?: string,
  dia?: number,
  mes?: string,
  anio?: number,
  tipoReporte?: string
}

export interface DatosAdministrador {
  nombreAdministrador?: string;
  lugardonacion?: string;
  matriculaAdministrador?: string;
}


