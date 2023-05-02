import {Funcionalidad} from "./funcionalidad.interface";

export interface Rol {
  id: number;
  idRol: number;
  desRol: string;
  nivel: string;
  nivelOficina: string;
  fCreacion: string;
  estatusRol: boolean;
  delegacion: string;
  velatorio: string;
  desNivelOficina: string;
  funcionalidades: Funcionalidad[];
}
