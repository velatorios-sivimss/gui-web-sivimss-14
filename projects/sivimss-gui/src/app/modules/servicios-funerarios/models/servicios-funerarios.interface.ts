export interface ServiciosFunerariosInterface {
  folioPlanSFPA?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  estado?: string;
  correoElectronico?: string;
  paquete?: string;
  tipoPaquete?: number;
  numeroPago?: number;
  estatusPlan?: string;
  estatusPago?: string;
  fechaContrato?: string;
  curp?: string;
  rfc?: string;
  matricula?: number;
  nss?: number;
  sexo?: number;
  fechaNacimiento?: string;
  nacionalidad?: number;
  lugarNacimiento?: string;
  telefono?: number;
  cp?: number;
  calle?: string;
  numeroInterior?: string;
  numeroExterior?: string;
  colonia?: string;
  municipio?: string;
  datosIguales?: boolean;
}

export interface DetallePago {
  velatorio?: string;
  pagos?: string;
  fechaPago?: string;
  metodoPago?: string;
  noReciboPago?: number;
  estatus?: string;
  monto?: number;
}
