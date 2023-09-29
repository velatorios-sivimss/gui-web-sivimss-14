export interface RespuestaModalUsuario {
  actualizar?: boolean,
  mensaje?: string,
  modificar?: boolean,
  usuario?: { contrasenia: string, usuario: string }
}
