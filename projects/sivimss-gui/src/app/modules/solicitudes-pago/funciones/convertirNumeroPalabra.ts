export function convertirNumeroPalabra(valor: number): string {
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

  if (!Number.isInteger(valor) || valor < 0 || valor > 9999999) {
    return '';
  }

  if (valor === 0) {
    return 'cero';
  }

  let words: string = '';

  if (valor >= 1000000) {
    const millones: number = Math.floor(valor / 1000000);
    words += convertirNumeroPalabra(millones) + ' millón ';
    valor %= 1000000;
  }

  if (valor >= 1000) {
    const miles: number = Math.floor(valor / 1000);
    words += convertirNumeroPalabra(miles) + ' mil ';
    valor %= 1000;
  }

  if (valor >= 100) {
    const cientos: number = Math.floor(valor / 100);
    words += palabrasCientos[cientos] + ' ';
    valor %= 100;
  }

  if (valor >= 10) {
    words += palabrasDecenas[Math.floor(valor / 10)] + ' ';
    valor %= 10;
  }

  if (valor > 0) {
    words += palabrasNumeros[valor];
  }

  return words.trim();
}
