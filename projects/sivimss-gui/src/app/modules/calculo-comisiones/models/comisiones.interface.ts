export interface Comisiones {
  idPromotor: number;
  numEmpleado: string;
  curp: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
}

export interface OpcionesArchivos {
  nombreArchivo?: string;
  ext?: "pdf" | "xlsx";
}



