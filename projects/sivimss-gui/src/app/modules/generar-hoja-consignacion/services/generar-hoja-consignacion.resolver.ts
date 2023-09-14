import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { GenerarHojaConsignacionService } from './generar-hoja-consignacion.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';

@Injectable()
export class GenerarHojaConsignacionResolver implements Resolve<any> {

    constructor(private generarHojaConsignacionService: GenerarHojaConsignacionService) { }

    resolve(): Observable<any> {
        const niveles$: Observable<TipoDropdown[]> = this.generarHojaConsignacionService.obtenerCatalogoNiveles();
        const delegaciones$: Observable<TipoDropdown[]> = this.generarHojaConsignacionService.obtenerCatalogoDelegaciones();
        // const catalogoVelatorio$: Observable<HttpRespuesta<any>> = this.generarHojaConsignacionService.obtenerVelatorios({ catalogo: 1 });
        return forkJoin([niveles$, delegaciones$]);
    }
}