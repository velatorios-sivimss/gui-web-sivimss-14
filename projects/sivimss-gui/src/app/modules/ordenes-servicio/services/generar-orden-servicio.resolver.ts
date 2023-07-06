import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { GenerarOrdenServicioService } from './generar-orden-servicio.service';
import { forkJoin, Observable } from 'rxjs';

@Injectable()
export class GenerarOrdenServicioResolver implements Resolve<any> {
  constructor(
    private generarOrdenServicioService: GenerarOrdenServicioService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const catalogoPaises$ =
      this.generarOrdenServicioService.obtenerCatalogoPais();
    const catalogoEstados$ =
      this.generarOrdenServicioService.obtenerCatalogoEstado();
    const catalogoParentesco$ =
      this.generarOrdenServicioService.obtenerCatalogoParentesco();
    const catalogoUnidadesMedicas$ =
      this.generarOrdenServicioService.obtenerCatalogosUnidadesMedicas();
    const catalogoPenciones$ =
      this.generarOrdenServicioService.obtenerCatalogosPenciones();

    return forkJoin([
      catalogoPaises$,
      catalogoEstados$,
      catalogoParentesco$,
      catalogoUnidadesMedicas$,
      catalogoPenciones$,
    ]);
  }
}
