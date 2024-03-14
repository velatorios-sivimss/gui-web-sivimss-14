import {Injectable} from '@angular/core';
import {RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {ServiciosFunerariosService} from "./servicios-funerarios.service";

@Injectable()
export class ServiciosFunerariosCancelacionResolver {

  constructor(private serviciosFunerariosService: ServiciosFunerariosService,) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idPlanSfpa: number = +route.queryParams.idPlanSfpa;
    const consulta$ = this.serviciosFunerariosService.consultarPlanSFPA(idPlanSfpa);
    const catEstados$ = this.serviciosFunerariosService.obtenerCatalogoEstados();
    const catPaises$ = this.serviciosFunerariosService.obtenerCatalogoPais();
    return forkJoin([consulta$, catEstados$, catPaises$]);
  }
}
