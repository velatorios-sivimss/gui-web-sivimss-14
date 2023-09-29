import {Funcionalidad} from "./funcionalidad.interface";

export interface Rol {
  id?: number;
  idRol?: number;
  desRol?: string;
  nivel?: string;
  nivelOficina?: string;
  fCreacion?: string;
  estatusRol?: boolean;
  estatus?: boolean;
  delegacion?: string;
  velatorio?: string;
  desNivelOficina?: string;
  nombre?: string;
  funcionalidades?: Funcionalidad[];
}
