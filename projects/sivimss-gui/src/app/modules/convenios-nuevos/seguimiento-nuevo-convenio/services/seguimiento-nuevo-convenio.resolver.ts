// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
// import { ArticulosService } from './articulos.service';
import { SeguimientoNuevoConvenioService } from './seguimiento-nuevo-convenio.service';

@Injectable()
export class SeguimientoNuevoConvenioResolver implements Resolve<any> {

    constructor(private SeguimientoNuevoConvenioResolver: SeguimientoNuevoConvenioService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return of([])
    }
}
