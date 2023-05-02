export interface Proveedores {
  id?: number;
  nombre?: string;
  banco?: string;
  cuenta?: string;
  tipoProveedor?: string;
  claveBancaria?: string;
  rfc?: string;
  curp?: string;
  tipoContrato?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  telefono?: string;
  correoElectronico?: string;
  regimen?: string;
  representanteLegal?: string;
  estatus?: boolean;
  rol?: string;
  responsableSanitario?: string;

  codigoPostal?: string;
  calle?: string;
  numExterior?: string;
  numInterior?: string;
  pais?: string;
  estado?: string;
  municipio?: string;

  codigoPostalReferencia?: string;
  calleReferencia?: string;
  numExteriorReferencia?: string;
  numInteriorReferencia?: string;
  paisReferencia?: string;
  estadoReferencia?: string;
  municipioReferencia?: string;
}


export interface ConfirmacionServicio {
  estatus?: boolean;
  origen?: string;
}


