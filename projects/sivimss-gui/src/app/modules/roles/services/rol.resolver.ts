import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {forkJoin, Observable} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {RolService} from "./rol.service";

@Injectable()
export class RolResolver implements Resolve<HttpRespuesta<any>> {

  constructor(private rolService: RolService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const roles$ = this.rolService.obtenerCatRoles();
    const niveles$ = this.rolService.obtenerCatalogoNiveles();
    return forkJoin([roles$, niveles$])
  }
}
