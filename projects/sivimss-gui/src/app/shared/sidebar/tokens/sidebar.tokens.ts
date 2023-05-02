import { InjectionToken } from "@angular/core";

export const TIEMPO_TRANSICION = new InjectionToken<number>('Tiempo de la transicion en segundos');
export const WIDTH_SIDEBAR = new InjectionToken<number>('Width del sidebar en pixeles');
export const INICIALIZAR_SIDEBAR_ABIERTO = new InjectionToken<boolean>('Establece si el sidebar iniciara abierto');
