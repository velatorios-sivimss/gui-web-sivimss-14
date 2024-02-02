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
  fechaNacimiento?: number | null;
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

export interface ConsultaPaginado {
                   ESTADO: string | null,
        ESTATUS_PLAN_SFPA: string | null,
             ID_PLAN_SFPA: number | null,
                  TITULAR: string | null,
      NUM_FOLIO_PLAN_SFPA: string | null,
              NUMERO_PAGO: string | null,
                  PAQUETE: string | null,
       CORREO_ELECTRONICO: string | null,
  ESTATUS_PAGO_ANTICIPADO: string | null,
}

export interface GenerarReporte{
        idVelatorio: string | null,
   numFolioPlanSfpa: string | null,
                rfc: string | null,
               curp: string | null,
     nombreAfiliado: string | null,
  idEstatusPlanSfpa: string | null,
        fechaInicio: string | null,
           fechaFin: string | null,
        tipoReporte: string | null,
}

export interface AgregarPlanSFPA {
                    idPlanSfpa?: number | null,
            indTipoPagoMensual?: boolean | null,
             idTipoContratacion: number | null,
                      idPaquete: number | null,
                      monPrecio: number | null,
                    indPromotor?: number | null,
                     idPromotor?: number | null,
               numFolioPlanSFPA?: string | null,
             idTipoPagoMensual : number | null,
           indTitularSubstituto: number | null,
                 numPagoMensual: number | null,
  indModificarTitularSubstituto: number | null,
        titularesBeneficiarios : Persona[],
}

export interface Persona {
  persona?: string | null,
  rfc?: string | null,
  curp?: string | null,
  matricula?: string | null,
  nss?: string | null,
  nomPersona?: string | null,
  primerApellido?: string | null,
  segundoApellido?: string | null,
  sexo?: number | null,
  otroSexo?: string | null,
  fecNacimiento?: string | null,
  idPais?: number | null,
  idEstado?: number | null,
  telefono?: string | null,
  telefonoFijo?: string | null,
  correo?: string | null,
  tipoPersona?: string | null,
  ine?: string | null,
  cp?: CodigoPostal | null
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
