import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {RolPermisosService} from "./rol-permisos.service";

@Injectable()
export class RolPermisosResolver implements Resolve<any> {

  constructor(private rolPermisosService: RolPermisosService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.rolPermisosService.obtenerCatRoles();
  }
}
