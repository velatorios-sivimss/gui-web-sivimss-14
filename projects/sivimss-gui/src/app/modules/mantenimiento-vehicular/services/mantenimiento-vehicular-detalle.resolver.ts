import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { MantenimientoVehicularService } from './mantenimiento-vehicular.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';

@Injectable()
export class MantenimientoVehicularDetalleResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idMttoVehicular: number = route.paramMap.get('idMttoVehicular') as unknown as number;
    const vehiculo$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerRegistroVehiculoByIdMtto(idMttoVehicular);
    const niveles$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    const proveedores$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoProvedores();
    const placas$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoPlacas();

    return forkJoin([vehiculo$, niveles$, proveedores$, delegaciones$, placas$])
  }
}
