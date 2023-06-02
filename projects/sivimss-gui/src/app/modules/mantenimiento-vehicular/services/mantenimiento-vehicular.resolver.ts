import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {MantenimientoVehicularService} from './mantenimiento-vehicular.service';

@Injectable()
export class MantenimientoVehicularResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$ = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$ = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    const proveedores$ = this.mantenimientoVehicularService.obtenerCatalogoProvedores();
    const placas$ = this.mantenimientoVehicularService.obtenerCatalogoPlacas();

    return forkJoin([niveles$, delegaciones$, proveedores$, placas$])
  }
}
