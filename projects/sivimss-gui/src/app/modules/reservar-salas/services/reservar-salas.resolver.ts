import {Injectable} from "@angular/core";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {ReservarSalasService} from "./reservar-salas.service";

import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class ReservarSalasResolver implements  Resolve<HttpRespuesta<any>> {

  constructor(private reservarSalasService: ReservarSalasService ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    const catVelatorio$ = this.reservarSalasService.obtenerCatalogoVelatorio();
    const catDelegacion$ = this.reservarSalasService.obtenerCatalogoDelegaciones();

    return forkJoin([catVelatorio$, catDelegacion$]);
  }
}
