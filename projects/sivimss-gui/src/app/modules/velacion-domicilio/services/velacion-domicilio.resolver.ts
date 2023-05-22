import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { VelacionDomicilioService } from './velacion-domicilio.service';
import { BuscarFoliosOds } from '../models/velacion-domicilio.interface';

@Injectable()
export class VelacionDomicilioResolver implements Resolve<any> {

    foliosOds: BuscarFoliosOds = {
        idDelegacion: null,
        idVelatorio: null,
    };

    constructor(private velacionDomicilioService: VelacionDomicilioService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const niveles$ = this.velacionDomicilioService.obtenerCatalogoNiveles();
        const delegaciones$ = this.velacionDomicilioService.obtenerCatalogoDelegaciones();
        const ods$ = this.velacionDomicilioService.obtenerOds(this.foliosOds);
        return forkJoin([niveles$, delegaciones$, ods$]);
    }
}
