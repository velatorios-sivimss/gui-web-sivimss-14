import {TipoDropdown} from "../models/tipo-dropdown";

export function diferenciaUTC(fecha: string, divisor: string = "/"): number {
  const [dia, mes, anio]: string[] = fecha.split(divisor);
  const objetoFecha: Date = new Date(+anio, +mes - 1, +dia);
  return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
}

export function validarAlMenosUnCampoConValor(values: object) {
  if (!Object.values(values).find(value => value !== '' && value !== null)) {
    return false;
  }
  return true;
}

export function mapearArregloTipoDropdown(arr: [] = [], label: string, value: string): TipoDropdown[] {
  return arr.map(obj => ({
    label: obj[label],
    value: obj[value]
  }));
}

export function obtenerDiferenciaEntreFechasEnAnios(fechaInicio: Date, fechaFin: Date) {
  const anioInicio: number = fechaInicio.getFullYear();
  const anioFin: number = fechaFin.getFullYear();
  const mesInicio: number = fechaInicio.getMonth();
  const mesFin: number = fechaFin.getMonth();
  const diaInicio: number = fechaInicio.getDate();
  const diaFin: number = fechaFin.getDate();
  let diferencia: number = anioFin - anioInicio;

  // validar si el mes y el día en fecha Inicio son anterioes en Fecha Fin
  if (mesFin < mesInicio || (mesFin === mesInicio && diaFin < diaInicio)) {
    diferencia--;
  }

  // Revisar si las dos fechas estan en el mismo anio bisiesto
  const esBisiestoInicio: boolean = esAnioBisiesto(anioInicio);
  const esBisiestoFin: boolean = esAnioBisiesto(anioFin);
  if (!esBisiestoInicio && esBisiestoFin && (mesFin > 1 || (mesFin === 1 && diaFin === 29))) {
    diferencia++;
  }
  if (esBisiestoInicio && !esBisiestoFin && (mesInicio > 1 || (mesInicio === 1 && diaInicio === 29))) {
    diferencia--;
  }
  return diferencia;
}

// Validar si es anio bisiesto
function esAnioBisiesto(anio: number): boolean {
  return anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
}

export function existeMensajeEnEnum(enumObj: { [s: string]: string }, valor: string): boolean {
  const valores = Object.values(enumObj);
  return valores.includes(valor);
}

export function validarUsuarioLogueado(): boolean {
  return !localStorage.getItem('sivimss_token');
}
