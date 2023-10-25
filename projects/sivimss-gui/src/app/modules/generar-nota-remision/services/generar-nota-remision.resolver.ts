
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { GenerarNotaRemisionService } from './generar-nota-remision.service';

@Injectable()
export class GenerarNotaRemisionResolver implements Resolve<any> {

    constructor(private generarNotaRemisionService: GenerarNotaRemisionService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const niveles$ = this.generarNotaRemisionService.obtenerCatalogoNiveles();
        const delegaciones$ = this.generarNotaRemisionService.obtenerCatalogoDelegaciones();
        return forkJoin([niveles$, delegaciones$]);
    }
}
