import {TipoAlerta} from "../../../shared/alerta/services/alerta.service";

export const MENSAJES_CURP = new Map();

MENSAJES_CURP.set(0, {mensaje: "Curp valido", tipo: TipoAlerta.Exito, valido: true})
MENSAJES_CURP.set(1, {mensaje: "Curp duplicado", tipo: TipoAlerta.Error, valido: false})
MENSAJES_CURP.set(2, {mensaje: "Curp mal formado", tipo: TipoAlerta.Error, valido: false})
