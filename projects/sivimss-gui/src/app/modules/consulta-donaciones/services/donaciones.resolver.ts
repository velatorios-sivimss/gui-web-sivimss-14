import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable } from "rxjs";
import { ConsultaDonacionesService } from './consulta-donaciones.service';

@Injectable()
export class DonacionesResolver implements Resolve<any> {

  constructor(private donacionesService: ConsultaDonacionesService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    // const catalogoVelatorios$ = this.donacionesService.obtenerCatalogoVelatorios();
    const catalogoNiveles$ = this.donacionesService.obtenerCatalogoNiveles();
    const catalogoDelegaciones$ = this.donacionesService.obtenerCatalogoDelegaciones();

    return forkJoin([
      catalogoNiveles$,
      catalogoDelegaciones$,
    ]);
  }
}
