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

export interface AgregarPlanSFPA {
             idTipoContratacion: number | null,
                      idPaquete: number | null,
             idTipoPagoMensual : number | null,
           indTitularSubstituto: number | null,
  indModificarTitularSubstituto: number | null,
        titularesBeneficiarios :Persona[] | null
}

export interface Persona {
  persona: string | null,
  rfc: string | null,
  curp: string | null,
  matricula: string | null,
  nss: string | null,
  nomPersona: string | null,
  primerApellido: string | null,
  segundoApellido: string | null,
  sexo: number | null,
  otroSexo: string | null,
  fecNacimiento: string | null,
  idPais: number | null,
  idEstado: number | null,
  telefono: string | null,
  telefonoFijo: string | null,
  correo: string | null,
  tipoPersona: string | null,
  ine: string | null,
  cp: CodigoPostal | null
}

export interface CodigoPostal {
  desCalle: string | null
  numExterior: string | null
  numInterior: string | null
  codigoPostal: number | null
  desColonia: string | null
  desMunicipio: string | null
  desEstado: string | null
}
