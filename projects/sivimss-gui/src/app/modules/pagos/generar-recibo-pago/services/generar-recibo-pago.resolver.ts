import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {GenerarReciboService} from './generar-recibo-pago.service';

@Injectable()
export class GenerarReciboResolver implements Resolve<any> {

  constructor(private generarReciboService: GenerarReciboService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$ = this.generarReciboService.obtenerCatalogoNiveles();
    const delegaciones$ = this.generarReciboService.obtenerCatalogoDelegaciones();
    return forkJoin([niveles$, delegaciones$])
  }
}
