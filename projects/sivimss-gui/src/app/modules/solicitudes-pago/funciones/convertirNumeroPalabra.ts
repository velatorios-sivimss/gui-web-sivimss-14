const palabrasDecenas: string[] = [
  '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
];

const palabrasNumeros: string[] = [
  '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
];

export function convertirNumeroPalabra(valor: number): string {

  if (!Number.isFinite(valor) || valor < 0 || valor > 9999999) {
    return '';
  }

  // Verifica si el número es decimal
  const esDecimal: boolean = valor % 1 !== 0;

  // Divide el número en parte entera y parte decimal
  const parteEntera: number = Math.floor(valor);
  const parteDecimal: number = valor - parteEntera;

  // Convierte la parte entera en palabras
  const palabrasParteEntera: string = convertirParteEntera(parteEntera);

  // Convierte la parte decimal en palabras
  const palabrasParteDecimal: string = convertirParteDecimal(parteDecimal);


  // Combina las palabras de la parte entera y parte decimal
  if (esDecimal) {
    return palabrasParteEntera + ' punto ' + palabrasParteDecimal;
  } else {
    return palabrasParteEntera;
  }
}

function convertirParteEntera(valor: number): string {

  const palabrasCientos: string[] = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
  ];

  const millones: number = Math.floor(valor / 1000000);
  const miles: number = Math.floor((valor % 1000000) / 1000);
  const cientos: number = Math.floor((valor % 1000) / 100);
  const decenas: number = Math.floor((valor % 100) / 10);
  const unidades: number = valor % 10;

  let words: string = '';

  if (valor === 0) {
    return 'cero';
  }

  if (millones === 1) {
    words += 'un millón ';
  }

  if (millones > 1) {
    words += convertirNumeroPalabra(millones) + ' millones ';
  }

  if (miles === 1) {
    words += ' mil ';
    valor = valor - miles * 1000;
  }

  if (miles > 1) {
    words += convertirNumeroPalabra(miles) + ' mil ';
    valor = valor - miles * 1000;
  }

  if (cientos > 0) {
    words += (cientos === 1 && decenas === 0 && unidades === 0) ? 'cien ' : palabrasCientos[cientos] + ' ';
    valor = valor - cientos * 100;
  }

  if (valor < 30) {
    words += palabrasNumeros[valor];
  }

  if (decenas > 2 && unidades === 0) {
    words += palabrasDecenas[decenas];
  }

  if (decenas > 2 && unidades > 0) {
    words += palabrasDecenas[decenas] + ' y ' + palabrasNumeros[unidades];
  }

  return words.trim();
}

function convertirParteDecimal(valor: number): string {

  const decimalesStr: string = valor.toFixed(2).split('.')[1]; // Tomar dos decimales

  const unidadesDecimal: number = parseInt(decimalesStr.charAt(1), 10);
  const decenasDecimal: number = parseInt(decimalesStr.charAt(0), 10);

  let palabrasParteDecimal: string = '';

  if (+decimalesStr < 30) {
    palabrasParteDecimal += palabrasNumeros[+decimalesStr];
  }

  if (decenasDecimal > 2 && unidadesDecimal === 0) {
    palabrasParteDecimal += palabrasDecenas[decenasDecimal];
  }

  if (decenasDecimal > 2 && unidadesDecimal > 0) {
    palabrasParteDecimal += palabrasDecenas[decenasDecimal] + ' y ' + palabrasNumeros[unidadesDecimal];
  }

  return palabrasParteDecimal;
}
