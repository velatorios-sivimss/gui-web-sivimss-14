export interface RegistroSolicitudMttoInterface {
  idMttoVehicular: null | number,
  idMttoestado: null | number,
  idVehiculo: null | number,
  idDelegacion: null | number,
  idVelatorio: null | number,
  idEstatus: null | number,
  verificacionInicio: null | number,
  solicitud: {
    idMttoSolicitud: null | number,
    idMttoVehicular: null | number,
    idMttoTipo: string,
    idMttoModalidad: string,
    fecRegistro: string | null,
    desMttoCorrectivo: string,
    idMttoModalidadDet: null | number,
    idEstatus: null | number
  },
  registro: null | number
}
