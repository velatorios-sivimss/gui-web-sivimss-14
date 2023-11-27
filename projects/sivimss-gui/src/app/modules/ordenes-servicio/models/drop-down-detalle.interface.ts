import {ContenidoPaqueteInterface} from "./ContenidoPaquete,interface";

export interface DropDownDetalleInterface {
  contratante: {
    parentesco: string | null,
    lugarNacimiento: string | null,
    paisNacimiento: string | null,
  },
  finado: {
    tipoorden: string | null,
    lugarNacimiento: string | null,
    paisNacimiento: string | null,
    clinicaAdscripcion: string | null,
    unidadProcedencia: string | null,
    tipoPension: string | null,
    numeroContrato: string | null,
    matricula: string | null,
  },
  caracteristicas: {
    paquete: string | null,
    tipoOtorgamiento: string | null,
  },
  informacion: {
    capilla: string | null,
    sala: string | null,
    promotor: string | null,
  },
  tablaPaquete: ContenidoPaqueteInterface [],
  totalPaquete: number
}
