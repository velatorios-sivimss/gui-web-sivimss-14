export const SIVIMSS_TOKEN: string = "sivimss_token";

export const DIEZ_ELEMENTOS_POR_PAGINA = 10;

export enum Accion {
    Agregar,
    Modificar,
    Detalle,
    Activar,
    Desactivar,
    Renovar,
};

export const PATRON_CORREO = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PATRON_CURP = /[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9][0-9]/;
