import {Funcionalidad} from "./funcionalidad.interface";

export interface Rol {
  id: number;
  idRol: number;
  nombre: string;
  nivel: string;
  fCreacion: string;
  estatus: boolean;
  delegacion: string;
  velatorio: string;
  idFuncionalidad: number;
  funcionalidad: string;
  permisos: string;
  funcionalidades: Funcionalidad[];
}
