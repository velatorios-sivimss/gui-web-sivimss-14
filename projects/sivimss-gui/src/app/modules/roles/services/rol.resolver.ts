import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {forkJoin, Observable} from "rxjs";
import {RolService} from "./rol.service";

@Injectable()
export class RolResolver implements Resolve<any> {

  constructor(private rolService: RolService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoRoles$ = this.rolService.obtenerCatRoles();
    const catalogoNivel$ = this.rolService.obtenerCatNivel();
    return forkJoin([catalogoRoles$, catalogoNivel$]);
  }
}
