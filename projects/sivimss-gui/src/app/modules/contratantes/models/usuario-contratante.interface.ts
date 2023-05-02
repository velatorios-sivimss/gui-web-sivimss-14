export interface UsuarioContratante {
  id?: number;
  curp?: string;
  nss?: number;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  rfc?: string;
  sexo?: number;
  sexoOtro?: string;
  fechaNacimiento?: string;
  nacionalidad?: number;
  pais?: number;
  lugarNacimiento?: string;
  telefono?: number;
  correoElectronico?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  cp?: number;
  colonia?: string;
  municipio?: string;
  estado?: string;
  estatus?: boolean;
}

export interface ConfirmarContratante {
  usuarioContratante?:UsuarioContratante,
  estatus?: boolean;
}
