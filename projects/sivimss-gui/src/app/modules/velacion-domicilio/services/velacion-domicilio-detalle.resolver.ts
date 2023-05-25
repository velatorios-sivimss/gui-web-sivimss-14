import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { VelacionDomicilioService } from './velacion-domicilio.service';

@Injectable()
export class VelacionDomicilioDetalleResolver implements Resolve<any> {

    constructor(private velacionDomicilioService: VelacionDomicilioService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const idValeSalida = +(route.paramMap.get('idValeSalida') || 0);
        const detalleValeSalida$ = this.velacionDomicilioService.obtenerDetalleValeSalida(idValeSalida);
        return forkJoin([detalleValeSalida$]);
    }
}
