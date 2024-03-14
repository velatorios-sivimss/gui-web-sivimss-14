import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {
  AutenticacionService,
  PermisosPorFuncionalidad
} from "projects/sivimss-gui/src/app/services/autenticacion.service";
import {Observable, of, throwError} from 'rxjs';
import {concatMap} from "rxjs/operators";
import {UsuarioEnSesion} from "../models/usuario-en-sesion.interface";
import {obtenerNivelUsuarioLogueado} from "../utils/funciones";

@Injectable()
export class ValidaNivelGuard implements CanActivate {
  constructor(
    private readonly aut: AutenticacionService,
    private router: Router) {
  }

  /**
   * Valida que el usuario tenga acceso a la funcionalidad y al permiso.
   * Si los permisos son nulos estara intentando cada segundo hasta que se hayan cargado completamente.
   * Una vez cargados validara si se tiene o no el permiso.
   * @param route
   * @param state
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route.data && route.data.validaNivel) {
      return this.aut.permisosUsuario$.pipe(
        concatMap((permisosPorFuncionalidad: PermisosPorFuncionalidad[] | null) => {
            if (!permisosPorFuncionalidad) {
              return throwError('Los permisos aún no se han cargado');
            } else {
              const {nivel} = route.data.validaNivel;
              const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
              const idNivel: number = obtenerNivelUsuarioLogueado(usuario)
              return idNivel !== nivel ? of(true) : of(this.router.parseUrl('/inicio'))
            }
          }
        ))
    } else {
      return true;
    }
  }
}
