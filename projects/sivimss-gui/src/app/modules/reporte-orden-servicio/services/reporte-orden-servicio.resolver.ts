import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ReporteOrdenServicioService} from "./reporte-orden-servicio.service";
import {forkJoin, Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class ReporteOrdenServicioResolver implements Resolve<any> {

  constructor(private reporteOrdenServicioService:ReporteOrdenServicioService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catDelegacion$ = this.reporteOrdenServicioService.obtenerCatalogoDelegaciones();
    const catNivel$ = this.reporteOrdenServicioService.obtenerCatalogoNiveles();
    return forkJoin([catDelegacion$,catNivel$]);
  }
}
