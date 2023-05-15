import {VerificacionInicio} from "./verificacion-inicio.interface";

export interface RegistroVerificacionInterface {
  idDelegacion: number,
  idEstatus: number,
  idMttoVehicular: number | null,
  idMttoestado: number,
  idVehiculo: number,
  idVelatorio: number,
  registro: number | null,
  solicitud: number | null,
  verificacionInicio: VerificacionInicio
}
