import {TipoAlerta} from "../../../shared/alerta/services/alerta.service";

export const MENSAJES_MATRICULA = new Map();

MENSAJES_MATRICULA.set(0, {mensaje: "Matricula valida", tipo: TipoAlerta.Exito, valido: true})
MENSAJES_MATRICULA.set(1, {mensaje: "Matricula duplicada", tipo: TipoAlerta.Error, valido: false})
