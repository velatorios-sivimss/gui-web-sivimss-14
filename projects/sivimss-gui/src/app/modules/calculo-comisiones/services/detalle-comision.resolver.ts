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
        debugger
        const id = +(route.paramMap.get('id') || 0);
        const detalleComision$ = this.calculoComisionesService.obtenerDetalleComision(id);
        return forkJoin([detalleComision$]);
    }
}