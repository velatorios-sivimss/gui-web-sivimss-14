export interface RegistroSolicitudMttoInterface {
  idMttoVehicular: null | number,
  idMttoestado: number,
  idVehiculo: number,
  idDelegacion: number,
  idVelatorio: number,
  idEstatus: number,
  verificacionInicio: null,
  solicitud: {
    idMttoSolicitud: null | number,
    idMttoVehicular: null | number,
    idMttoTipo: string,
    idMttoModalidad: string,
    fecRegistro: string | null,
    desMttoCorrectivo: string,
    idMttoModalidadDet: number,
    idEstatus: number,
    kilometraje: number,
    desNotas: string
  },
  registro: null
}
