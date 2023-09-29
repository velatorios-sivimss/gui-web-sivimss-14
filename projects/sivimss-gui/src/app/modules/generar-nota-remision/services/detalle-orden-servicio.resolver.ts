import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve, RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from "rxjs";
import { GenerarNotaRemisionService } from './generar-nota-remision.service';

@Injectable()
export class DetalleOrderServicioResolver implements Resolve<any> {

    constructor(private generarNotaRemisionService: GenerarNotaRemisionService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const idOds = +(route.paramMap.get('idOds') ?? 0);
        const detalleOrdenServicio$ = this.generarNotaRemisionService.obtenerDatosOrdenServicio(idOds);
        const servicios$ = this.generarNotaRemisionService.obtenerServiciosNotaRemision({ idNota: null, idOrden: idOds });
        return forkJoin([detalleOrdenServicio$, servicios$]);
    }
}
