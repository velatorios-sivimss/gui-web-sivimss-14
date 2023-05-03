import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {GenerarFormatoPagareService} from './generar-formato-pagare.service';

@Injectable()
export class GenerarFormatoPagareResolver implements Resolve<any> {

  constructor(private generarFormatoPagareService: GenerarFormatoPagareService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$ = this.generarFormatoPagareService.obtenerCatalogoNiveles();
    const delegaciones$ = this.generarFormatoPagareService.obtenerCatalogoDelegaciones();
    return forkJoin([niveles$, delegaciones$])
  }
}
