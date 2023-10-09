export interface FormatoDetalleComisiones {
    idPromotor?: number;
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
    anioCalculo?: string;
    mesCalculo?: any;
    monBonoAplicado?: number;
    monConveniosPF?: number;
    monComisionODS?: number;
    numConveniosPF?: number;
    numOrdenesServicio?: number;
    tipoReporte?: string;
}

export interface OpcionesArchivos {
    nombreArchivo?: string;
    ext?: "pdf" | "xlsx";
}
