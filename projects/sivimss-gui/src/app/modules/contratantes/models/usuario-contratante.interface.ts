export interface UsuarioContratante {
  idContratante?: number;
  idPersona?: number;
  curp?: string;
  nss?: number;
  nombre?: string;
  paterno?: string;
  materno?: string;
  rfc?: string;
  numSexo?: number;
  otroSexo?: string;
  sexo?: string;
  fecNacimiento?: string;
  nacionalidad?: string;
  pais?: number;
  lugarNacimiento?: string;
  idEstado?: number;
  idPais?: number;
  telefono?: number;
  correo?: string;
  calle?: string;
  numExt?: string;
  numInt?: string;
  cp?: number;
  colonia?: string | null;
  municipio?: string;
  estado?: string;
  estatus?: boolean;
  idDomicilio?: number;
}

export interface ConfirmarContratante {
  usuarioContratante?: UsuarioContratante,
  estatus?: boolean;
}

export interface BusquedaContratante {
  nomContratante?: string;
  idContratante?: number;
  estatus?: boolean,
  fecNacimiento?: string;
  tel?: string;
  idPersona?: number;
  curp?: string;
  rfc?: string;
  idDomicilio?: number;
  nss?: string;
}

export interface ValorCP {
  idCodigoPostal: number,
  colonia: string,
  municipio: string,
  estado: string
}

export interface TipoCatalogo {
  idCatalogo: number,
  cp?: number
}

export interface BuscarContratantes {
  curp?: string | null;
  nss?: string | null;
  nomContratante?: string | null;
  id?: number | null;
  estatus?: boolean | null;
}