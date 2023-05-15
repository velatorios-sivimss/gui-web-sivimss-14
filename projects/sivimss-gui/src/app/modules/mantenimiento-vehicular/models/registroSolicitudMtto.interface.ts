export interface RegistroSolicitudMttoInterface {
  idMttoVehicular: number,
  idMttoestado: number,
  idVehiculo: number,
  idDelegacion: number,
  idVelatorio: number,
  idEstatus: number,
  verificacionInicio: number,
  solicitud: {
    idMttoSolicitud: number,
    idMttoVehicular: number,
    idMttoTipo: string,
    idMttoModalidad: string,
    fecRegistro: string,
    desMttoCorrectivo: string,
    idMttoModalidadDet: number,
    idEstatus: number,
    kilometraje: number,
    desNotas: string
  },
  registro: number
}
