import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {CapillaReservacionService} from './capilla-reservacion.service';

@Injectable()
export class CapillaReservacionResolver implements Resolve<any> {

  constructor(private capillaReservacionService: CapillaReservacionService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoVelatorios$ = this.capillaReservacionService.obtenerCatalogoVelatorios();
    const catDelegacion$ = this.capillaReservacionService.obtenerCatalogoDelegaciones();
    return forkJoin([catalogoVelatorios$, catDelegacion$]);
  }
}
