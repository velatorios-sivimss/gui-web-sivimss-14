// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { GenerarNotaRemisionService } from './generar-nota-remision.service';
import { ConsultaNotaRemision } from '../models/nota-remision.interface';

@Injectable()
export class DetalleNotaRemisionResolver implements Resolve<any> {

    constructor(private generarNotaRemisionService: GenerarNotaRemisionService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const idNota = +(route.paramMap.get('idNota') ?? 0);
        const idOds = +(route.paramMap.get('idOds') ?? 0);
        const detalleNotaRemision$ = this.generarNotaRemisionService.obtenerDetalleNotaRemision({ idNota, idOrden: idOds });
        const serviciosNotaRemision$ = this.generarNotaRemisionService.obtenerServiciosNotaRemision({ idNota, idOrden: idOds });
        return forkJoin([detalleNotaRemision$, serviciosNotaRemision$]);
    }
}
