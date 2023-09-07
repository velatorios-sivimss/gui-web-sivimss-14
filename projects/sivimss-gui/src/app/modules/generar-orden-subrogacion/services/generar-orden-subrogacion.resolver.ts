// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { GenerarOrdenSubrogacionService } from './generar-orden-subrogacion.service';

@Injectable()
export class GenerarOrdenSubrogacionResolver implements Resolve<any> {

    constructor(private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const niveles$ = this.generarOrdenSubrogacionService.obtenerCatalogoNiveles();
        const delegaciones$ = this.generarOrdenSubrogacionService.obtenerCatalogoDelegaciones();
        return forkJoin([niveles$, delegaciones$]);
    }
}
