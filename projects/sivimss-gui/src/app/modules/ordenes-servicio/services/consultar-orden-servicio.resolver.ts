import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ConsultarOrdenServicioService} from "./consultar-orden-servicio.service";
import {forkJoin,Observable} from "rxjs";

@Injectable()
export class ConsultarOrdenServicioResolver implements Resolve<any> {
  constructor(private consultarOrdenServicioService:ConsultarOrdenServicioService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catDelegacion$ = this.consultarOrdenServicioService.obtenerCatalogoDelegaciones();
    // const tipoOrdenODS$ = this.consultarOrdenServicioService.consultaTipoODS();
    // const estatusODS$ = this.consultarOrdenServicioService.obtenerCatalogoEstatus();
    // const consultarContratantes$ = this.consultarOrdenServicioService.nombreContratante();
    // const consultarFinados$ = this.consultarOrdenServicioService.nombreFinado();

    //,tipoOrdenODS$,estatusODS$,consultarContratantes$,consultarFinados$
    return forkJoin([catDelegacion$]);
  }
}
