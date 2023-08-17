import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { CalculoComisionesService } from './calculo-comisiones.service';

@Injectable()
export class DetalleComisionResolver implements Resolve<any> {

    constructor(private calculoComisionesService: CalculoComisionesService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const idComision = +(route.paramMap.get('id') || 0);
        const detallePromotor$ = this.calculoComisionesService.obtenerDetallePromotor(idComision);
        const detalleODS$ = this.calculoComisionesService.obtenerDetalleODS(idComision);
        const detalleConveniosPF$ = this.calculoComisionesService.obtenerDetalleConveniosPF(idComision);
        return forkJoin([detallePromotor$, detalleODS$, detalleConveniosPF$]);
    }
}
