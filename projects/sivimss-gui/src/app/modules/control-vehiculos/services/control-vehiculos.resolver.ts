import { Injectable } from "@angular/core";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { ControlVehiculosService } from "./control-vehiculos.service";

import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from "rxjs";

@Injectable()
export class ReservarSalasResolver implements Resolve<HttpRespuesta<any>> {

  constructor(private controlVehiculosService: ControlVehiculosService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catNiveles$ = this.controlVehiculosService.obtenerCatalogoNiveles();
    const catDelegacion$ = this.controlVehiculosService.obtenerCatalogoDelegaciones();
    return forkJoin([catNiveles$, catDelegacion$]);
  }
}
