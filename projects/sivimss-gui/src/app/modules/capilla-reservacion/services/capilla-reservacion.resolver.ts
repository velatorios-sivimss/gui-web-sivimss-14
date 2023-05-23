// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable } from "rxjs";
import { CapillaReservacionService } from './capilla-reservacion.service';

@Injectable()
export class capillaReservacionResolver implements Resolve<any> {

    constructor(private capillaReservacionService: CapillaReservacionService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
          const catalogoCapillasDisponibles$ = this.capillaReservacionService.obtenerCatalogoCapillasDisponibles();
          const catalogoVelatorios$ = this.capillaReservacionService.obtenerCatalogoVelatorios();
          const catDelegacion$ = this.capillaReservacionService.obtenerCatalogoDelegaciones();
        return forkJoin([
          // catalogoCapillasDisponibles$,
          catalogoVelatorios$,
          catDelegacion$

        ]);

        // return this.articulosService.obtenerCatCategorias();
        // return of([])
    }
}
