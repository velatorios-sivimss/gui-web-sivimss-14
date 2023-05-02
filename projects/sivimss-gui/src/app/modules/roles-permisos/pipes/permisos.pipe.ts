import {Pipe, PipeTransform} from '@angular/core';
import {Funcionalidad} from "../models/funcionalidad.interface";

@Pipe({
  name: 'cadenaPermisos'
})
export class PermisosPipe implements PipeTransform {

  transform(funcionalidad: Funcionalidad): string {
    let permisos = [];
    if (funcionalidad.alta) {
      permisos.push('Alta')
    }
    if (funcionalidad.consulta) {
      permisos.push('Consulta');
    }
    if (funcionalidad.modificar) {
      permisos.push('Modificar');
    }
    if (funcionalidad.aprobacion) {
      permisos.push('Aprobación')
    }
    if (funcionalidad.baja) {
      permisos.push('Baja');
    }
    if (funcionalidad.imprimir) {
      permisos.push('Imprimir');
    }
    return permisos.join(', ');
  }

}
