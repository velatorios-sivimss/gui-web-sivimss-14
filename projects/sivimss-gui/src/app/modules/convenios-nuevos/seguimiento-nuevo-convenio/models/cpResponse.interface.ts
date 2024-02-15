export interface CpRespuesta {
  clave: string,
  codigoPostal: string,
  localidad: string,
  municipio: {
    clave: string,
    entidadFederativa: {
      clave: string,
      nombre: string
    },
    nombre: string
  },
  nombre: string,
  periodo: number,
  tipoAsentamiento: string
}
