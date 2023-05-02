// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable } from "rxjs";
import { ArticulosService } from './articulos.service';

@Injectable()
export class ArticulosResolver implements Resolve<any> {

    constructor(private articulosService: ArticulosService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const catalogoCategorias$ = this.articulosService.obtenerCatalogoCategorias();
        const catalogoTiposArticulos$ = this.articulosService.obtenerCatalogoTiposArticulos();
        const catalogoTiposMateriales$ = this.articulosService.obtenerCatalogoTiposMateriales();
        const catalogoTamanios$ = this.articulosService.obtenerCatalogoTamanios();
        const catalogoClasificacionProductos$ = this.articulosService.obtenerCatalogoClasificacionProductos();
        const catalogoPartidasPresupuestales$ = this.articulosService.obtenerCatalogoPartidasPresupuestales();
        const catalogoCuentasContables$ = this.articulosService.obtenerCatalogoCuentasContables();
        const catalogoClavesSat$ = this.articulosService.obtenerCatalogoClavesSat();
        return forkJoin([
            catalogoCategorias$,
            catalogoTiposArticulos$,
            catalogoTiposMateriales$,
            catalogoTamanios$,
            catalogoClasificacionProductos$,
            catalogoPartidasPresupuestales$,
            catalogoCuentasContables$,
            catalogoClavesSat$,
        ]);

        // return this.articulosService.obtenerCatCategorias();
        // return of([])
    }
}
