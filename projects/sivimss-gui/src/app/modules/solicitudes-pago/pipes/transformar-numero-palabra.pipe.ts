import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'transformarNumeroPalabra'})
export class TransformarNumeroPalabraPipe implements PipeTransform {

  transform(value: number): null | string {
    if (!Number.isInteger(value) || value < 0 || value > 9999999) {
      return null;
    }

    const numberWords: string[] = [
      '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
      'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
      'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
    ];

    const tensWords: string[] = [
      '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
    ];

    const hundred: number = Math.floor(value / 1000000);
    const tenThousand: number = Math.floor((value % 1000000) / 100000);
    const thousand: number = Math.floor((value % 100000) / 10000);
    const hundredUnit: number = Math.floor((value % 10000) / 1000);
    const tens: number = Math.floor((value % 1000) / 10);
    const units: number = value % 10;

    let words: string = '';

    if (hundred > 0) {
      words += numberWords[hundred] + ' millones ';
    }

    if (tenThousand > 0) {
      words += tensWords[tenThousand] + ' mil ';
    }

    if (thousand > 0) {
      words += numberWords[thousand] + ' mil ';
    }

    if (hundredUnit > 0) {
      words += numberWords[hundredUnit] + ' cien ';
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
}
