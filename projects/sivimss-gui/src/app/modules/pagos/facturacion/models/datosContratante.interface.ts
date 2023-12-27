import {MetodosPagoFact} from "./metodosPagoFact.interface";
import {ServiciosContratados} from "./serviciosContratados.interface";

export interface DatosContratante {
  concPago: string,
  correo: string
  fecOds: string,
  fecPago: string,
  metodosPago: MetodosPagoFact[],
  nomContratante: string
  rfc: string
  servicios: ServiciosContratados[],
  totalPagado: number,
  totalServicios: number,
  idVelatorio: number,
  finado: Finado
}

interface Finado {
  fecFinado: string
  idFinado: string
  nomFinado: string
}
