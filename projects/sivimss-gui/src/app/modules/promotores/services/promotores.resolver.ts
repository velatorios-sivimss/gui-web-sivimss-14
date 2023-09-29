import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { PromotoresService } from './promotores.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';

@Injectable()
export class PromotoresResolver implements Resolve<any> {

    constructor(private promotoresService: PromotoresService) { }

    resolve(): Observable<any> {
        const niveles$: Observable<TipoDropdown[]> = this.promotoresService.obtenerCatalogoNiveles();
        const delegaciones$: Observable<TipoDropdown[]> = this.promotoresService.obtenerCatalogoDelegaciones();
        const catalogoVelatorio$: Observable<HttpRespuesta<any>> = this.promotoresService.obtenerCatalogos({ catalogo: 1 });
        const catalogoEstados$: Observable<TipoDropdown[]> = this.promotoresService.obtenerCatalogoEstados();
        return forkJoin([niveles$, delegaciones$, catalogoVelatorio$, catalogoEstados$]);
    }
}
