export interface RegistroMantenimiento {
  idMttoVehicular: number,
  idMttoestado: number,
  idVehiculo: number,
  idDelegacion: number,
  idVelatorio: number,
  idEstatus: number,
  verificacionInicio: null,
  solicitud: null,
  registro: {
    idMttoRegistro: number,
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
