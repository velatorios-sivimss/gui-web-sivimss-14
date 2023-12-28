import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {forkJoin, Observable} from "rxjs";
import {RolService} from "./rol.service";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";

@Injectable()
export class RolResolver implements Resolve<any> {

  constructor(private rolService: RolService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoRoles$: Observable<HttpRespuesta<any>> = this.rolService.obtenerCatRoles();
    const catalogoNivel$: Observable<TipoDropdown[]> = this.rolService.obtenerCatNivel();
    return forkJoin([catalogoRoles$, catalogoNivel$]);
  }
}
