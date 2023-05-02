import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AutenticacionService, Permiso, PermisosPorFuncionalidad } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { funcionalidades, permisos } from "projects/sivimss-gui/src/app/utils/constantes-funcionalidades-permisos";
import { Observable, of, throwError } from 'rxjs';
import { concatMap, delay, retryWhen } from "rxjs/operators";

@Injectable()
export class ValidaRolGuard implements CanActivate {
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

    if (route.data && route.data.validaRol) {
      const {funcionalidad, permiso} = route.data.validaRol;
      const idFuncionalidad: string = funcionalidades[funcionalidad];
      const idPermiso: string = permisos[permiso];
      return this.aut.permisosUsuario$.pipe(
        concatMap((permisosPorFuncionalidad: PermisosPorFuncionalidad[] | null) => {
          if (!permisosPorFuncionalidad) {
            return throwError('Los permisos aún no se han cargado');
          } else {
            const funcionalidadEncontrada: PermisosPorFuncionalidad | undefined = permisosPorFuncionalidad.find((permisosPorFuncionalidad: PermisosPorFuncionalidad) => permisosPorFuncionalidad.idFuncionalidad === idFuncionalidad);
            if (funcionalidadEncontrada) {
              const permisoEncontrado: Permiso | undefined = funcionalidadEncontrada.permisos.find((permiso: Permiso) => permiso.idPermiso === idPermiso);
              if (permisoEncontrado) {
                return of(true);
              }
            }
            return of(this.router.parseUrl('/inicio'));
          }
        }),
        retryWhen(errors => errors.pipe(delay(1000)))
      );
    } else {
      return true;
    }
  }
}
