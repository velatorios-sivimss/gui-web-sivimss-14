import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ReportesService} from "./reportes.service";
import {forkJoin, Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class ReportesResolver implements Resolve<any> {

  constructor(private reporteOrdenServicioService:ReportesService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catDelegacion$ = this.reporteOrdenServicioService.obtenerCatalogoDelegaciones();
    const catNivel$ = this.reporteOrdenServicioService.obtenerCatalogoNiveles();
    const catPromotores$ = this.reporteOrdenServicioService.consultarPromotoresComisionPromotor();
    return forkJoin([catDelegacion$,catNivel$,catPromotores$]);
  }
}
