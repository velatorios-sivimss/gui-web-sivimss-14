import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable } from "rxjs";
import {GestionarDonacionesService} from "./gestionar-donaciones.service";

@Injectable()
export class GestionarDonacionesResolver implements Resolve<any> {

  constructor(private donacionesService: GestionarDonacionesService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoEstados$ = this.donacionesService.obtenerCatalogoEstados();
    const catalogoPaises$ = this.donacionesService.obtenerCatalogoPaises();
    return forkJoin([
      catalogoEstados$,
      catalogoPaises$
    ]);
  }
}
