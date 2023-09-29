import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { ActualizarOrdenServicioService } from './actualizar-orden-servicio.service';
import { forkJoin, Observable } from 'rxjs';

@Injectable()
export class ActualizarOrdenServicioResolver implements Resolve<any> {
  constructor(
    private ActualizarOrdenServicioService: ActualizarOrdenServicioService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const catalogoPaises$ =
      this.ActualizarOrdenServicioService.obtenerCatalogoPais();
    const catalogoEstados$ =
      this.ActualizarOrdenServicioService.obtenerCatalogoEstado();
    const catalogoParentesco$ =
      this.ActualizarOrdenServicioService.obtenerCatalogoParentesco();
    const catalogoUnidadesMedicas$ =
      this.ActualizarOrdenServicioService.obtenerCatalogosUnidadesMedicas();
    const catalogoPenciones$ =
      this.ActualizarOrdenServicioService.obtenerCatalogosPenciones();

    return forkJoin([
      catalogoPaises$,
      catalogoEstados$,
      catalogoParentesco$,
      catalogoUnidadesMedicas$,
      catalogoPenciones$,
    ]);
  }
}
