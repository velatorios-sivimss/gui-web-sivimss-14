import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BnNgIdleService} from 'bn-ng-idle';
import {HttpRespuesta} from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import {Payload} from "projects/sivimss-gui/src/app/models/payload.interface";
import {UsuarioEnSesion} from "projects/sivimss-gui/src/app/models/usuario-en-sesion.interface";
import {BreadcrumbService} from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {MenuSidebarService} from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import {SIVIMSS_TOKEN, SIVIMSS_TOKEN_ONLINE} from "projects/sivimss-gui/src/app/utils/constantes";
import {existeMensajeEnEnum} from "projects/sivimss-gui/src/app/utils/funciones";
import {MensajesRespuestaAutenticacion} from "projects/sivimss-gui/src/app/utils/mensajes-respuesta-autenticacion.enum";
import {MensajesRespuestaCodigo} from "projects/sivimss-gui/src/app/utils/mensajes-respuesta-codigo.enum";
import {TIEMPO_MAXIMO_INACTIVIDAD_PARA_CERRAR_SESION} from "projects/sivimss-gui/src/app/utils/tokens";
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {concatMap, map} from "rxjs/operators";
import {JwtHelperService} from "@auth0/angular-jwt";
import {environment} from '../../environments/environment';
import {CookieService} from "ngx-cookie-service";

export interface Modulo {
  idModuloPadre: string | null;
  idFuncionalidad: string | null;
  idModulo: string;
  titulo: string;
  modulos: Modulo[] | null;
  activo?: boolean;
  ruta?: string;
  icono?: string;
}

export interface PermisosPorRol {
  permisosPorFuncionalidad: PermisosPorFuncionalidad[];
}

export interface PermisosPorFuncionalidad {
  idFuncionalidad: string;
  permisos: Permiso[];
}

export interface Permiso {
  idPermiso: string;
  descPermiso: string;
}

@Injectable()
export class AutenticacionService {

  usuarioEnSesionSubject: BehaviorSubject<UsuarioEnSesion | null> = new BehaviorSubject<UsuarioEnSesion | null>(null);
  usuarioEnSesion$: Observable<UsuarioEnSesion | null> = this.usuarioEnSesionSubject.asObservable();

  permisosUsuarioSubject: BehaviorSubject<PermisosPorFuncionalidad[] | null> = new BehaviorSubject<PermisosPorFuncionalidad[] | null>(null);
  permisosUsuario$: Observable<PermisosPorFuncionalidad[] | null> = this.permisosUsuarioSubject.asObservable();

  paginaCargadaSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  paginaCargada$: Observable<boolean> = this.paginaCargadaSubject.asObservable();

  existeUnaSesion$: Observable<boolean> = this.usuarioEnSesion$.pipe(
    map((usuario: UsuarioEnSesion | null) => !!usuario)
  );

  subsSesionInactivaTemporizador!: Subscription;
  usuario: string | null = null;
  contrasenia: string | null = null;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly menuSidebarService: MenuSidebarService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly controladorInactividadUsuarioService: BnNgIdleService,
    @Inject(TIEMPO_MAXIMO_INACTIVIDAD_PARA_CERRAR_SESION) private readonly tiempoMaximoInactividad: number,
    private readonly cookieService: CookieService
  ) {
    this.recuperarSesionAlActualizarPagina();
  }

  /**
   * Crea la sesion nuevamente si el usuario actualiza la pagina
   */
  recuperarSesionAlActualizarPagina() {
    const token: string | null = this.cookieService.get(SIVIMSS_TOKEN);
    if (token) {
      try {
        const usuario: UsuarioEnSesion = this.obtenerUsuarioDePayload(token);
        this.usuarioEnSesionSubject.next(usuario);
        setTimeout(() => {
          this.obtenerPermisos(usuario.idRol).subscribe((respuesta: HttpRespuesta<any>) => {
            this.permisosUsuarioSubject.next(respuesta.datos.permisosUsuario);
            this.iniciarTemporizadorSesion();
            this.paginaCargadaSubject.next(true);
          });
        }, 1000);
      } catch (ex) {
        this.cerrarSesion();
        this.paginaCargadaSubject.next(true);
      }
    } else {
      this.paginaCargadaSubject.next(true);
    }
  }

  iniciarSesion(usuario: string, contrasenia: string, mostrarMsjContraseniaProxVencer: boolean = true): Observable<string> {
    return this.httpClient.post<any>(environment.api.login + `/login`, {usuario, contrasenia}).pipe(
      concatMap((respuesta: HttpRespuesta<any>) => {
        if (this.esInicioSesionCorrecto(respuesta.mensaje) || (respuesta.mensaje === MensajesRespuestaAutenticacion.ContraseniaProximaVencer && !mostrarMsjContraseniaProxVencer)) {
          const usuario: UsuarioEnSesion = this.obtenerUsuarioDePayload(respuesta.datos);
          return this.obtenerPermisos(usuario.idRol).pipe(map((respuestaPermisos: HttpRespuesta<any>) => {
            this.crearSesion(respuesta.datos, usuario, respuestaPermisos.datos.permisosUsuario);
            this.paginaCargadaSubject.next(true);
            return MensajesRespuestaAutenticacion.InicioSesionCorrecto;
          }));
        } else if (this.esMensajeRespuestaValido(MensajesRespuestaAutenticacion, respuesta.mensaje)) {
          return of<string>(respuesta.mensaje);
        } else {
          return 'Ocurrió un error al intentar iniciar sesión';
        }
      }),
    );
  }

  esMensajeRespuestaValido(enumObj: { [s: string]: string }, mensaje: string): boolean {
    return existeMensajeEnEnum(MensajesRespuestaAutenticacion, mensaje);
  }

  esInicioSesionCorrecto(mensaje: string): boolean {
    return mensaje === MensajesRespuestaAutenticacion.InicioSesionCorrecto;
  }

  crearSesion(token: string, usuario: UsuarioEnSesion, permisosUsuario: PermisosPorFuncionalidad[]): void {
    this.breadcrumbService.limpiar();
    this.usuarioEnSesionSubject.next(usuario);
    this.permisosUsuarioSubject.next(permisosUsuario);
    this.cookieService.set(SIVIMSS_TOKEN, token);
    this.obtenerCatalogos();
    this.iniciarTemporizadorSesion();
  }

  obtenerUsuarioDePayload(token: string): UsuarioEnSesion | never {
    const payload: Payload | null = new JwtHelperService().decodeToken<Payload>(token);
    if (payload) {
      return JSON.parse(payload.sub);
    } else {
      throw new Error('Error al intentar obtener el usuario del payload en el token');
    }
  }

  cerrarSesion() {
    this.breadcrumbService.limpiar();
    this.menuSidebarService.limpiarRutaSeleccionada();
    this.usuarioEnSesionSubject.next(null);
    this.permisosUsuarioSubject.next(null);
    this.cookieService.deleteAll();
    this.cookieService.delete(SIVIMSS_TOKEN);
    void this.router.navigate(['/inicio-sesion']);
    this.detenerTemporizadorSesion();
  }

  obtenerModulosPorIdRol(idRol: string): Observable<HttpRespuesta<Modulo[]>> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/menu`, {idRol});
  }

  actualizarContrasenia(usuario: string, contraseniaAnterior: string, contraseniaNueva: string): Observable<HttpRespuesta<any>> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/contrasenia/cambiar`, {
      usuario,
      contraseniaAnterior,
      contraseniaNueva
    });
    //return of<HttpRespuesta<any>>(respuestaCambioContrasenia); NOSONAR
  }

  obtenerPermisos(idRol: string) {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/permisos`, {idRol});
    // return of<HttpRespuesta<any>>(respuestaPermisosUsuario); NOSONAR
  }

  existeFuncionalidadConPermiso(idFuncionalidad: string, idPermiso: string): boolean {
    const permisosPorFuncionalidad: PermisosPorFuncionalidad[] | null = this.permisosUsuarioSubject.getValue();
    if (permisosPorFuncionalidad) {
      const funcionalidadEncontrada: PermisosPorFuncionalidad | undefined = permisosPorFuncionalidad.find((permisosPorFuncionalidad: PermisosPorFuncionalidad) => permisosPorFuncionalidad.idFuncionalidad === idFuncionalidad);
      if (funcionalidadEncontrada) {
        const permisoEncontrado: Permiso | undefined = funcionalidadEncontrada.permisos.find((permiso: Permiso) => permiso.idPermiso === idPermiso);
        if (permisoEncontrado) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  iniciarTemporizadorSesion() {
    this.subsSesionInactivaTemporizador = this.controladorInactividadUsuarioService
      .startWatching(this.tiempoMaximoInactividad)
      .subscribe((estaElUsuarioInactivo: boolean) => {
        if (estaElUsuarioInactivo) {
          this.cerrarSesion();
        }
      });
  }

  detenerTemporizadorSesion() {
    this.controladorInactividadUsuarioService.stopTimer();
    if (this.subsSesionInactivaTemporizador) {
      this.subsSesionInactivaTemporizador.unsubscribe();
    }
  }

  validarCodigoRestablecerContrasenia(usuario: string, codigo: string): Observable<string> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/contrasenia/valida-codigo`, {
      usuario,
      codigo
    }).pipe(
      concatMap((respuesta: HttpRespuesta<any>) => {
        if (existeMensajeEnEnum(MensajesRespuestaCodigo, respuesta.mensaje)) {
          return of<string>(respuesta.mensaje);
        } else {
          return 'Ocurrió un error al intentar validar el código para recuperar contraseña';
        }
      })
    );
  }

  generarCodigoRestablecerContrasenia(usuario: string): Observable<HttpRespuesta<any>> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/contrasenia/genera-codigo`, {usuario});
  }

  obtenerCatalogos(): void {
    this.httpClient.post<HttpRespuesta<any>>(environment.api.login + '/catalogos/consulta', {})
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.procesarCatalogos(respuesta),
        error: (error) => console.log(error)
      });
  }

  procesarCatalogos(respuesta: HttpRespuesta<any>): void {
    const {datos} = respuesta;
    const {catalogos} = datos ?? {};
    this.guardarCatalogosEnCookies(catalogos);
  }

  guardarCatalogosEnCookies<T extends { [key: string]: T }>(obj: T): void {
    Object.keys(obj).forEach(propiedad => {
      this.cookieService.set(`catalogo_${propiedad}`, JSON.stringify(obj[propiedad]), 1);
    });
  }

  obtenerCatalogoDeCookies<T>(propiedad: string): any {
    const catalogo = JSON.parse(this.cookieService.get(propiedad) as string);
    return catalogo ?? [];
  }

  validarUsuarioLogueado(): boolean {
    return !this.cookieService.get(SIVIMSS_TOKEN)
  }

  validarUsuarioLogueadoOnline(): boolean {
    return !this.cookieService.get(SIVIMSS_TOKEN_ONLINE)
  }

  obtenerUsuarioEnSesion(): UsuarioEnSesion {
    return JSON.parse(this.cookieService.get('usuario') as string);
  }
}
