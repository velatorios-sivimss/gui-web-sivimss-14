import {VerificacionInicio} from "./verificacionInicio.interface";

export interface RegistroVerificacionInterface {
  idDelegacion: number,
  idEstatus: number,
  idMttoVehicular: number | null,
  idMttoestado: number | null,
  idVehiculo: number,
  idVelatorio: number,
  registro: null,
  solicitud: null,
  verificacionInicio: VerificacionInicio
}
