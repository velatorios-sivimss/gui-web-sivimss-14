export interface FormatoDetalleComisiones {
    // Promotor
    numEmpleado?: string;
    curp?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    fecNacimiento?: string;
    fecIngreso?: string;
    velatorio?: string;
    sueldoBase?: number;
    puesto?: string;
    correo?: string;
    categoria?: string;
    diasDescanso?: string;
    monComision?: number;
  
    // Datos Comisión
    numOrdenesServicio?: number;
    monComisionODS?: number;
    numConveniosPF?: number;
    monConveniosPF?: number;
    monBonoAplicado?: number;
    
    tipoReporte?: string;
}

export interface OpcionesArchivos {
    nombreArchivo?: string;
    ext?: "pdf" | "xlsx";
}