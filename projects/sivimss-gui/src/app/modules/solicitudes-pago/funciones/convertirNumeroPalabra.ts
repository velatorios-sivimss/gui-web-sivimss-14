export function convertirNumeroPalabra(valor: number): string {
  if (!Number.isInteger(valor) ||  valor < 0 || valor > 9999999) {
    return '';
  }

  const palabrasNumeros: string[] = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
  ];

  const palabrasDecenas: string[] = [
    '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
  ];

  const palabrasCientos: string[] = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
  ];

  const millones: number = Math.floor(valor / 1000000);
  const miles: number = Math.floor((valor % 1000000) / 1000);
  const cientos: number = Math.floor((valor % 1000) / 100);
  const decenas: number = Math.floor((valor % 100) / 10);
  const unidades: number = valor % 10;

  let words: string = '';

  if (millones === 1) {
    words += 'un millón ';
  }

  if (millones > 1) {
    words += convertirNumeroPalabra(millones) + ' millones ';
  }

  if (miles === 1) {
    words += ' mil ';
  }

  if (miles > 1) {
    words += convertirNumeroPalabra(miles) + ' mil ';
  }

  if (cientos > 0) {
    words += (cientos === 1 && decenas === 0 && unidades === 0) ? 'cien ' : palabrasCientos[cientos] + ' ';
  }

  if (decenas === 0) {
    words += palabrasNumeros[unidades];
  }

  if (decenas === 1) {
    words += palabrasNumeros[decenas * 10 + unidades];
  }

  if (decenas > 1 && unidades === 0) {
    words += palabrasDecenas[decenas];
  }

  if (decenas > 1 && unidades > 0) {
    words += ' y ' + palabrasNumeros[unidades];
  }



  return words.trim();
}

