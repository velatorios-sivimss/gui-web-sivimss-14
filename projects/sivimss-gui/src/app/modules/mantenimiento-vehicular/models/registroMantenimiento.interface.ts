export interface RegistroMantenimiento {
  idMttoVehicular: null | number,
  idMttoestado: number,
  idVehiculo: number,
  idDelegacion: number,
  idVelatorio: number,
  idEstatus: number,
  verificacionInicio: null,
  solicitud: null,
  registro: {
    idMttoRegistro: null | number,
    idMttoVehicular: null | number,
    idMttoModalidad: null | string,
    idMantenimiento: null | number,
    desNotas: string,
    idProveedor: number,
    desNumcontrato: string,
    kilometraje: number,
    desNombreTaller: string,
    costoMtto: string
  }
}
