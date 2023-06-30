export interface RegistroSolicitudMttoInterface {
  idMttoVehicular: number | null,
  idMttoestado: number | null,
  idVehiculo: number,
  idDelegacion: number,
  idVelatorio: number | null,
  idEstatus: number,
  verificacionInicio: null,
  solicitud: {
    idMttoSolicitud: null | number,
    idMttoVehicular: null | number,
    idMttoTipo: string,
    idMttoModalidad: string,
    fecRegistro: string | null,
    fecRegistro2: string | null,
    desMttoCorrectivo: string,
    idEstatus: number | null,
    kilometraje: number,
    desNotas: string
    idMttoTipoModalidad: number | null,
    idMttoTipoModalidadDet: number | null,
  },
  registro: null
}
