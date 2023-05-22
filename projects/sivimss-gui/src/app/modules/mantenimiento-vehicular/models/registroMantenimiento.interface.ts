export interface RegistroMantenimiento {
  idMttoVehicular: null,
  idMttoestado: number,
  idVehiculo: number,
  idDelegacion: number,
  idVelatorio: number,
  idEstatus: number,
  verificacionInicio: null,
  solicitud: null,
  registro: {
    idMttoRegistro: null,
    idMttoVehicular: number,
    idMttoModalidad: string,
    idMantenimiento: number,
    desNotas: string,
    idProveedor: number,
    desNumcontrato: string,
    kilometraje: number,
    desNombreTaller: string,
    costoMtto: string
  }
}
