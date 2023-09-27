import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";

import { ConsultaConveniosService } from "./consulta-convenios.service";

@Injectable()
export class ConsultaConveniosResolver implements Resolve<any> {
  constructor(private consultaConveniosService: ConsultaConveniosService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoConvenios$ = this.consultaConveniosService.obtenerCatalogo({ idCatalogo: 4 });
    return forkJoin([catalogoConvenios$]);
  }
}
