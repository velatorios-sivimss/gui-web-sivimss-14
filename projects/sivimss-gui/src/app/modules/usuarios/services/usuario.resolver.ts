import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {forkJoin, Observable} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {UsuarioService} from "./usuario.service";
import {TipoDropdown} from "../../../models/tipo-dropdown";

@Injectable()
export class UsuarioResolver implements Resolve<HttpRespuesta<any>> {

  constructor(private usuarioService: UsuarioService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$: Observable<TipoDropdown[]> = this.usuarioService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.usuarioService.obtenerCatalogoDelegaciones();
    const estados$: Observable<TipoDropdown[]> = this.usuarioService.obtenerCatalogoEstados();
    return forkJoin([niveles$, delegaciones$, estados$])
  }
}
