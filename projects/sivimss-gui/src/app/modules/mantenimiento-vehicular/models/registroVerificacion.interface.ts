import {VerificacionInicio} from "./verificacionInicio.interface";

export interface RegistroVerificacionInterface {
  idDelegacion: number,
  idEstatus: number,
  idMttoVehicular: number,
  idMttoestado: number,
  idVehiculo: number,
  idVelatorio: number,
  registro: number,
  solicitud: number,
  verificacionInicio: VerificacionInicio
}
