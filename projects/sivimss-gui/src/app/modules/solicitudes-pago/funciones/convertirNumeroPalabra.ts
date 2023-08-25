export function convertirNumeroPalabra(valor: number): string {
  const palabrasNumeros: string[] = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
  ];

  const palabrasDecenas: string[] = [
    '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
  ];

  const palabrasCientos: string[] = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
  ];

  const millones: number = Math.floor(valor / 1000000);
  const miles: number = Math.floor((valor % 1000000) / 1000);
  const cientos: number = Math.floor((valor % 1000) / 100);
  const decenas: number = Math.floor((valor % 100) / 10);
  const unidades: number = valor % 10;

  if (!Number.isInteger(valor) || valor < 0 || valor > 9999999) {
    return '';
  }

  let words: string = '';

  if (valor === 0) {
    return 'cero';
  }

  if (!valor) return '';

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
