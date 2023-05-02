import { InjectionToken } from "@angular/core";

export const TIEMPO_MAXIMO_INACTIVIDAD_PARA_CERRAR_SESION = new InjectionToken<number>('Define el tiempo de inactividad en segundos para cerrar la sesión');
