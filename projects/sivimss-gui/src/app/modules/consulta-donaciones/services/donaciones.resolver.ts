import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable } from "rxjs";
import { ConsultaDonacionesService } from './consulta-donaciones.service';

@Injectable()
export class DonacionesResolver implements Resolve<any> {

    constructor(private donaionesService: ConsultaDonacionesService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
         //const catalogoDelegaciones$ = this.donaionesService.obtenerCatalogoDelegaciones();
        const catalogoVelatorios$ = this.donaionesService.obtenerCatalogoVelatorios();
        const catalogoNiveles$ = this.donaionesService.obtenerCatalogoNiveles();
        // const catalogoTamanios$ = this.donaionesService.obtenerCatalogoTamanios();
        // const catalogoClasificacionProductos$ = this.donaionesService.obtenerCatalogoClasificacionProductos();
        // const catalogoPartidasPresupuestales$ = this.donaionesService.obtenerCatalogoPartidasPresupuestales();
        // const catalogoCuentasContables$ = this.donaionesService.obtenerCatalogoCuentasContables();
        // const catalogoClavesSat$ = this.donaionesService.obtenerCatalogoClavesSat();
        return forkJoin([
          // catalogoDelegaciones$,
          catalogoVelatorios$,
          catalogoNiveles$,
            // catalogoTamanios$,
            // catalogoClasificacionProductos$,
            // catalogoPartidasPresupuestales$,
            // catalogoCuentasContables$,
            // catalogoClavesSat$,
        ]);

        // return this.articulosService.obtenerCatCategorias();
        // return of([])
    }
}
