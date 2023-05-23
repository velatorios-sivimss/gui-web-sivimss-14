import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {Observable} from 'rxjs';
import {MantenimientoVehicularService} from './mantenimiento-vehicular.service';

@Injectable()
export class MantenimientoVehicularDetalleResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const vehiculoId = route.paramMap.get('idVehiculo') as unknown as number;
    return this.mantenimientoVehicularService.obtenerRegistroVehiculo(vehiculoId);
  }
}
