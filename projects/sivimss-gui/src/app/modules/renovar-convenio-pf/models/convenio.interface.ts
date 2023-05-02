export interface ConvenioInterface {
  folioConvenio?: string;
  rfc?: string;
  numeroINE?: number;
  matriculaIMSS?: number;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  tipoPF?: number;
  descTipoPF?: string;
  tipoPaquete?: number;
  descTipoPaquete?: string;
  estatusConvenio?: boolean;
  cuotaRecuperacion?: number;
  fechaInicioVigencia?: string;
  fechaFinVigencia?: string;
  calle?: string;
  numeroInterior?: string;
  numeroExterior?: string;
  cp?: number;
  estado?: number;
  descEstado?: string;
  municipio?: string
  telefonoContacto?: number;
  correoElectronico?: string;
  beneficiarios?: number;
}
