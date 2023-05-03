import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable } from "rxjs";
import { ConsultaDonacionesService } from './consulta-donaciones.service';

@Injectable()
export class DonacionesResolver implements Resolve<any> {

  constructor(private donaionesService: ConsultaDonacionesService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoVelatorios$ = this.donaionesService.obtenerCatalogoVelatorios();
    const catalogoNiveles$ = this.donaionesService.obtenerCatalogoNiveles();
    const catalogoDelegaciones$ = this.donaionesService.obtenerCatalogoNiveles();
    return forkJoin([
      catalogoVelatorios$,
      catalogoNiveles$,
      catalogoDelegaciones$,
    ]);
  }
}
