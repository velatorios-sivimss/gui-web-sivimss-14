import {BeneficiarioInterface} from "./beneficiario.interface"
export interface ConveniosPrevisionFunerariaInterface {
  folioConvenio?: string;
  fechaContratacion?: string;
  fechaVigenciaInicio?: string;
  fechaVigenciaFin?: string;
  situacion?: string;
  factura?: string;
  importeConvenio?: number;
  estatus?: number;
  estatusConvenio?: string;
  estatusRenovacion?: number;
  idConvenio?: number;
  numeroConvenioAnterior?: number;
  nombre?: string;
  razonSocial?: string;
  rcc?: string;
  pais?: number;
  descPais?: string;
  cp?: number;
  colonia?:string;
  estado?: number;
  descEstado?: string;
  municipio?: number;
  descMunicipio?: string;
  calle?: string;
  nInterior?: string;
  nExterior?: string;
  telefono?: number;
  correoElectronico?: string;


  promotor?: number;
  matricula?: string;
  primerApellido?: string;
  segundoApellido?: string;
  enfermedadPrexistente?: number;
  descEnfermedadPrexistente?: string;
  tipoPaquete?: number;
  descTipoPaquete?: string;
  beneficiario?: BeneficiarioInterface[],
  cantidadBeneficiarios?: number;
}
