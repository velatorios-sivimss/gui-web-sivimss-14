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
    const idVehiculo: number = route.paramMap.get('idVehiculo') as unknown as number;
    const vehiculo$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerRegistroVehiculo(idVehiculo);
    const niveles$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    const proveedores$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoProvedores();
    const placas$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoPlacas();

    return forkJoin([vehiculo$, niveles$, proveedores$, delegaciones$, placas$])
  }
  // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
  //   const idVehiculo: number = route.paramMap.get('idVehiculo') as unknown as number;
  //   return this.mantenimientoVehicularService.obtenerRegistroVehiculo(idVehiculo);
  // }
  // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    
  //   return forkJoin([vehiculo$]);
  // }
}
