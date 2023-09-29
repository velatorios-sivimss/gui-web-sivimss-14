import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { VelacionDomicilioService } from './velacion-domicilio.service';

@Injectable()
export class VelacionDomicilioResolver implements Resolve<any> {

    constructor(private velacionDomicilioService: VelacionDomicilioService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const niveles$ = this.velacionDomicilioService.obtenerCatalogoNiveles();
        const delegaciones$ = this.velacionDomicilioService.obtenerCatalogoDelegaciones();
        return forkJoin([niveles$, delegaciones$]);
    }
}
