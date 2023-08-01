export function convertirNumeroPalabra(valor: number): string {
  if (!Number.isInteger(valor) || valor < 0 || valor > 9999999) {
    return '';
  }

  const numberWords: string[] = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
  ];

  const tensWords: string[] = [
    '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
  ];

  const hundredsWords: string[] = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
  ];

  const million: number = Math.floor(valor / 1000000);
  const thousand: number = Math.floor((valor % 1000000) / 1000);
  const hundreds: number = Math.floor((valor % 1000) / 100);
  const tens: number = Math.floor((valor % 100) / 10);
  const units: number = valor % 10;

  let words: string = '';

  if (million > 0) {
    if (million === 1) {
      words += 'un millón ';
    } else {
      words += convertirNumeroPalabra(million) + ' millones ';
    }
  }

  if (thousand > 0) {
    if (thousand === 1) {
      words += ' mil ';
    } else {
      words += convertirNumeroPalabra(thousand) + ' mil ';
    }
  }

  if (hundreds > 0) {
    words += (hundreds === 1 && tens === 0 && units === 0) ? 'cien ' : hundredsWords[hundreds] + ' ';
  }

  if (tens > 0) {
    if (tens === 1) {
      words += numberWords[tens * 10 + units];
    } else {
      words += tensWords[tens];
      if (units > 0) {
        words += ' y ' + numberWords[units];
      }
    }
  } else if (units > 0) {
    words += numberWords[units];
  }

  return words.trim();
}

