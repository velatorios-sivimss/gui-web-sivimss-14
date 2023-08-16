import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { PromotoresService } from './promotores.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';

@Injectable()
export class PromotoresResolver implements Resolve<any> {

    constructor(private promotoresService: PromotoresService) { }

    resolve(): Observable<any> {
        const niveles$: Observable<TipoDropdown[]> = this.promotoresService.obtenerCatalogoNiveles();
        const delegaciones$: Observable<TipoDropdown[]> = this.promotoresService.obtenerCatalogoDelegaciones();
        return forkJoin([niveles$, delegaciones$]);
    }
}
