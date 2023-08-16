export interface DetalleComision {
  numEmpleado?: string;
  primerApellido?: string;
  velatorio?: string;
  categoria?: string;
  segundoApellido?: string;
  montoComision?: number;
  nombre?: string;
  puesto?: string;
  correo?: string;
  fecNacimiento?: string;
  fecIngreso?: string;
  sueldoBase?: number;
  idPromotor?: number;
  curp?: string;
  }

  export interface DetalleODS {
    lugarCaptacion?: string;
    fechaODS?: string;
    nomFinado?: string;
    importeODS?: number;
    cveFolio?: string;
    importePagado?: number;
  }
  
  export interface DetalleConvenioPF {
    lugarCaptacion?: string;
    fechaCPF?: string;
    nomContratante?: string;
    importeCPF?: number;
    folioNCPF?: string;
    importePagado?: number;
  }
  
  export interface DetalleComisiones {
    monBonoAplicado?: number;
    monConveniosPF?: number;
    monComisionODS?: number;
    numConveniosPF?: number;
    numOrdenesServicio?: number;
  }

  export interface FiltroComisiones {
    idPromotor?: number;
    mesCalculo?: string;
    anioCalculo?: any; 
  }
  