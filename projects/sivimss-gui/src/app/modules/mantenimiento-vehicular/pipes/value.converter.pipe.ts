import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueConverter'
})
export class ValueConverterPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'BAJO') {
      return '1';
    } else if (value === 'MEDIO') {
      return '5';
    } else if (value === 'CORRECTO') {
      return '10';
    } else {
      return value;
    }
  }
}
