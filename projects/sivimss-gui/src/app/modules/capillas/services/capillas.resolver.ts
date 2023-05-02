import { Capilla } from './../models/capilla.interface';
// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';

import { CapillaService } from './capilla.service';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
// import { CapillaService } from './articulos.service';


@Injectable()
export class CapillasResolver implements Resolve<HttpRespuesta<any>> {

  constructor(private capillaService: CapillaService) { }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HttpRespuesta<any>> {
    // utils catalogoCapillas$ = this.capillaService.obtenerCatalogoCapillas();
    // utils catalogoTiposArticulos$ = this.capillaService.obtenerCatalogoTiposArticulos();
    // utils catalogoTiposMateriales$ = this.capillaService.obtenerCatalogoTiposMateriales();
    // utils catalogoTamanios$ = this.capillaService.obtenerCatalogoTamanios();
    // utils catalogoClasificacionProductos$ = this.capillaService.obtenerCatalogoClasificacionProductos();
    // utils catalogoPartidasPresupuestales$ = this.capillaService.obtenerCatalogoPartidasPresupuestales();
    // utils catalogoCuentasContables$ = this.capillaService.obtenerCatalogoCuentasContables();
    // utils catalogoClavesSat$ = this.capillaService.obtenerCatalogoClavesSat();
    return this.capillaService.obtenerCatalogoCapillas();
    // return
    //   catalogoCapillas$,
        // catalogoTiposArticulos$,
        // catalogoTiposMateriales$,
        // catalogoTamanios$,
        // catalogoClasificacionProductos$,
        // catalogoPartidasPresupuestales$,
        // catalogoCuentasContables$,
        // catalogoClavesSat$,
      //  return this.capillaService.obtenerCatalogoCapillas();
      // return of();

  }
}
