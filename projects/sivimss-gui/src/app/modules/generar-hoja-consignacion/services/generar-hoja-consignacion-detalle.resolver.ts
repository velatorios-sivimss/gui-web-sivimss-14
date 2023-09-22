import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { GenerarHojaConsignacionService } from './generar-hoja-consignacion.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';

@Injectable()
export class GenerarHojaConsignacionDetalleResolver implements Resolve<any> {

  constructor(private generarHojaConsignacionService: GenerarHojaConsignacionService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idHojaConsignacion: number = route.paramMap.get('idHojaConsignacion') as unknown as number;
    const hojaConsignacion$: Observable<HttpRespuesta<any>> = this.generarHojaConsignacionService.obtenerDetalleHojaConsignacion(idHojaConsignacion);
    const niveles$: Observable<TipoDropdown[]> = this.generarHojaConsignacionService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.generarHojaConsignacionService.obtenerCatalogoDelegaciones();

    return forkJoin([hojaConsignacion$, niveles$, delegaciones$])
  }
}
