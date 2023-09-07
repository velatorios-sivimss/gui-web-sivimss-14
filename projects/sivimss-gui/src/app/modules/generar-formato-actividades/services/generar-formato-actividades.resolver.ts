import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { GenerarFormatoActividadesService } from './generar-formato-actividades.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';

@Injectable()
export class GenerarFormatoActividadesResolver implements Resolve<any> {

    constructor(private generarFormatoActividadesService: GenerarFormatoActividadesService) { }

    resolve(): Observable<any> {
        const niveles$: Observable<TipoDropdown[]> = this.generarFormatoActividadesService.obtenerCatalogoNiveles();
        const delegaciones$: Observable<TipoDropdown[]> = this.generarFormatoActividadesService.obtenerCatalogoDelegaciones();
        const catalogoVelatorio$: Observable<HttpRespuesta<any>> = this.generarFormatoActividadesService.obtenerCatalogos({ catalogo: 1 });
        const catalogoEstados$: Observable<TipoDropdown[]> = this.generarFormatoActividadesService.obtenerCatalogoEstados();
        return forkJoin([niveles$, delegaciones$, catalogoVelatorio$, catalogoEstados$]);
    }
}
