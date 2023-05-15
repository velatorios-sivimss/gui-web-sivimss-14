import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BnNgIdleService} from 'bn-ng-idle';
import {HttpRespuesta} from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import {Payload} from "projects/sivimss-gui/src/app/models/payload.interface";
import {UsuarioEnSesion} from "projects/sivimss-gui/src/app/models/usuario-en-sesion.interface";
import {BreadcrumbService} from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {LoaderService} from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import {MenuSidebarService} from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import {SIVIMSS_TOKEN} from "projects/sivimss-gui/src/app/utils/constantes";
import {existeMensajeEnEnum} from "projects/sivimss-gui/src/app/utils/funciones";
import {MensajesRespuestaAutenticacion} from "projects/sivimss-gui/src/app/utils/mensajes-respuesta-autenticacion.enum";
import {MensajesRespuestaCodigo} from "projects/sivimss-gui/src/app/utils/mensajes-respuesta-codigo.enum";
import {dummyMenuResponse} from "projects/sivimss-gui/src/app/utils/menu-dummy";
import {TIEMPO_MAXIMO_INACTIVIDAD_PARA_CERRAR_SESION} from "projects/sivimss-gui/src/app/utils/tokens";
import {BehaviorSubject, Observable, of, Subscription, throwError} from 'rxjs';
import {concatMap, delay, map} from "rxjs/operators";
import {JwtHelperService} from "@auth0/angular-jwt";
import { environment } from '../../environments/environment.prod';

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

const respuestaInicioSesionCorrecto = {
  error: false,
  codigo: 200,
  mensaje: "INICIO_SESION_CORRECTO",
  datos: {
    "token": "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiMVwiLFwibm9tYnJlXCI6XCIxIDEgMVwiLFwiY3VycFwiOlwiMVwifSIsImlhdCI6MTY4MzEzNzM3MiwiZXhwIjoxNjgzNzQyMTcyfQ._TKsku_zi_PMLtPYnk_ghc7fYe8eainHxy1ehvJmpfU"
  }
};

const respuestaContraseniaProxVencer = {
  error: false,
  codigo: 200,
  mensaje: "CONTRASENIA_PROXIMA_VENCER",
  datos: {
    "token": "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiMVwiLFwibm9tYnJlXCI6XCIxIDEgMVwiLFwiY3VycFwiOlwiMVwifSIsImlhdCI6MTY4MzA0Mzk0OCwiZXhwIjoxNjgzNjQ4NzQ4fQ.lzgUw1U3115meofhWZXrYCDMaxP9QFAYpZ6yEbhRGZE"
  }
};

const respuestaPreActivo = {
  "error": false,
  "codigo": 200,
  "mensaje": "USUARIO_PREACTIVO",
  "datos": null
};

const respuestaCambioContrasenia = {
  "error": false,
  "codigo": 200,
  "mensaje": "Exito",
  "datos": true
};

const respuestaCredencialesIncorrectas = {
  "error": true,
  "codigo": 400,
  "mensaje": "CREDENCIALES_INCORRECTAS",
  "datos": null
};

const respuestaFechaContraseniaVencida = {
  "error": true,
  "codigo": 400,
  "mensaje": "FECHA_CONTRASENIA_VENCIDA",
  "datos": null
};

const respuestaCantidadMaximaIntentosFallidos = {
  "error": true,
  "codigo": 400,
  "mensaje": "CANTIDAD_MAX_INTENTOS_FALLIDOS",
  "datos": null
}

const respuestaCuentaBloqueada = {
  "error": true,
  "codigo": 400,
  "mensaje": "CUENTA_BLOQUEADA",
  "datos": null
}

const respuestaPermisosUsuario = {
  "error": false,
  "codigo": 200,
  "mensaje": "Exito",
  "datos": {
    "permisosUsuario": [
      {
        "idFuncionalidad": "1",
        "permisos": [
          {
            "idPermiso": "1",
            "descPermiso": "ALTA"
          },
          {
            "idPermiso": "2",
            "descPermiso": "BAJA"
          },
          {
            "idPermiso": "3",
            "descPermiso": "CONSULTA"
          },
          {
            "idPermiso": "4",
            "descPermiso": "MODIFICAR"
          },
          {
            "idPermiso": "5",
            "descPermiso": "APROBACIÓN"
          },
          {
            "idPermiso": "6",
            "descPermiso": "IMPRIMIR"
          }
        ]
      },
      {
        "idFuncionalidad": "2",
        "permisos": [
          {
            "idPermiso": "1",
            "descPermiso": "ALTA"
          },
          {
            "idPermiso": "2",
            "descPermiso": "BAJA"
          },
          {
            "idPermiso": "3",
            "descPermiso": "CONSULTA"
          },
          {
            "idPermiso": "4",
            "descPermiso": "MODIFICAR"
          },
          {
            "idPermiso": "5",
            "descPermiso": "APROBACIÓN"
          },
          {
            "idPermiso": "6",
            "descPermiso": "IMPRIMIR"
          }
        ]
      },
      {
        "idFuncionalidad": "3",
        "permisos": [
          {
            "idPermiso": "1",
            "descPermiso": "ALTA"
          },
          {
            "idPermiso": "2",
            "descPermiso": "BAJA"
          },
          {
            "idPermiso": "3",
            "descPermiso": "CONSULTA"
          },
          {
            "idPermiso": "4",
            "descPermiso": "MODIFICAR"
          },
          {
            "idPermiso": "5",
            "descPermiso": "APROBACIÓN"
          },
          {
            "idPermiso": "6",
            "descPermiso": "IMPRIMIR"
          }
        ]
      }
    ]
  }
};

const respuestaCatalogos = {
  "error": false,
  "codigo": 200,
  "mensaje": "Exito",
  "datos": {
    "catalogos": {
      "delegaciones": [
        {
          "id": 1,
          "desc": "AGUASCALIENTES"
        },
        {
          "id": 2,
          "desc": "BAJA CALIFORNIA"
        },
        {
          "id": 3,
          "desc": "BAJA CALIFORNIA SUR"
        },
        {
          "id": 4,
          "desc": "CAMPECHE"
        },
        {
          "id": 5,
          "desc": "COAHUILA"
        },
        {
          "id": 6,
          "desc": "COLIMA"
        },
        {
          "id": 7,
          "desc": "CHIAPAS"
        },
        {
          "id": 8,
          "desc": "CHIHUAHUA"
        },
        {
          "id": 9,
          "desc": "OFICINAS CENTRALES"
        },
        {
          "id": 10,
          "desc": "DURANGO"
        },
        {
          "id": 11,
          "desc": "GUANAJUATO"
        },
        {
          "id": 12,
          "desc": "GUERRERO"
        },
        {
          "id": 13,
          "desc": "HIDALGO"
        },
        {
          "id": 14,
          "desc": "JALISCO"
        },
        {
          "id": 15,
          "desc": "EDO DE MEX ORIENTE"
        },
        {
          "id": 16,
          "desc": "EDO DE MEX PONIENTE"
        },
        {
          "id": 17,
          "desc": "MICHOACAN"
        },
        {
          "id": 18,
          "desc": "MORELOS"
        },
        {
          "id": 19,
          "desc": "NAYARIT"
        },
        {
          "id": 20,
          "desc": "NUEVO LEON"
        },
        {
          "id": 21,
          "desc": "OAXACA"
        },
        {
          "id": 22,
          "desc": "PUEBLA"
        },
        {
          "id": 23,
          "desc": "QUERETARO"
        },
        {
          "id": 24,
          "desc": "QUINTANA ROO"
        },
        {
          "id": 25,
          "desc": "SAN LUIS POTOSI"
        },
        {
          "id": 26,
          "desc": "SINALOA"
        },
        {
          "id": 27,
          "desc": "SONORA"
        },
        {
          "id": 28,
          "desc": "TABASCO"
        },
        {
          "id": 29,
          "desc": "TAMAULIPAS"
        },
        {
          "id": 30,
          "desc": "TLAXCALA"
        },
        {
          "id": 31,
          "desc": "VERACRUZ NORTE"
        },
        {
          "id": 32,
          "desc": "VERACRUZ SUR"
        },
        {
          "id": 33,
          "desc": "YUCATAN"
        },
        {
          "id": 34,
          "desc": "ZACATECAS"
        },
        {
          "id": 35,
          "desc": "1 NOROESTE D.F."
        },
        {
          "id": 36,
          "desc": "2 NORESTE D.F."
        },
        {
          "id": 37,
          "desc": "3 SUROESTE D.F."
        },
        {
          "id": 38,
          "desc": "4 SURESTE D.F."
        },
        {
          "id": 39,
          "desc": "NOMINA DE MANDO"
        }
      ],
      "nivelOficina": [
        {
          "id": 1,
          "desc": "CENTRAL"
        },
        {
          "id": 2,
          "desc": "DELEGACIONAL"
        },
        {
          "id": 3,
          "desc": "VELATORIOS"
        }
      ],
      "parentesco": [],
      "paises": [],
      "estados": [],
      "tipoPension": [],
      "unidadesMedicas": []
    }
  }
};

const respCodigoRestablecerContrasenia = {
  "error": false,
  "codigo": 200,
  "mensaje": "Exito",
  "datos": "Codigo enviado al correo del Usuario "
}

const respCodigoCorrecto = {
  "error": false,
  "codigo": 200,
  "mensaje": "CODIGO_CORRECTO",
  "datos": null
}

const respCodigoIncorrecto = {
  "error": true,
  "codigo": 400,
  "mensaje": "CODIGO_INCORRECTO",
  "datos": null
}

const respCodigoExpirado = {
  "error": true,
  "codigo": 400,
  "mensaje": "CODIGO_EXPIRADO",
  "datos": null
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

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly menuSidebarService: MenuSidebarService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly loaderService: LoaderService,
    private readonly controladorInactividadUsuarioService: BnNgIdleService,
    @Inject(TIEMPO_MAXIMO_INACTIVIDAD_PARA_CERRAR_SESION) private readonly tiempoMaximoInactividad: number
  ) {
    this.recuperarSesionAlActualizarPagina();
  }

  /**
   * Crea la sesion nuevamente si el usuario actualiza la pagina
   */
  recuperarSesionAlActualizarPagina() {
    const token: string | null = localStorage.getItem(SIVIMSS_TOKEN);
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
    // this.paginaCargadaSubject.next(false);
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
          return throwError('Ocurrió un error al intentar iniciar sesión');
        }
      })
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
    localStorage.setItem(SIVIMSS_TOKEN, token);
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
    localStorage.removeItem(SIVIMSS_TOKEN);
    localStorage.clear();
    this.router.navigate(['/inicio-sesion']);
    this.detenerTemporizadorSesion();
  }

  obtenerModulosPorIdRol(idRol: string): Observable<HttpRespuesta<Modulo[]>> {
    //this.httpClient.get<RespuestaHttp<Modulo>>('');
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/menu`, {idRol});
    // return of<HttpRespuesta<Modulo[]>>(dummyMenuResponse);
  }

  actualizarContrasenia(usuario: string, contraseniaAnterior: string, contraseniaNueva: string): Observable<HttpRespuesta<any>> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/contrasenia/cambiar`, {usuario, contraseniaAnterior, contraseniaNueva});
    //return of<HttpRespuesta<any>>(respuestaCambioContrasenia);
  }

  obtenerPermisos(idRol: string) {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/permisos`, {idRol});
    // return of<HttpRespuesta<any>>(respuestaPermisosUsuario);
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
    //return this.http.post<HttpRespuesta>(`http://localhost:8080/mssivimss-oauth/contrasenia/valida-codigo`, {usuario,codigo})
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/contrasenia/valida-codigo`, {usuario,codigo}).pipe(
      concatMap((respuesta: HttpRespuesta<any>) => {
        if (existeMensajeEnEnum(MensajesRespuestaCodigo, respuesta.mensaje)) {
          return of<string>(respuesta.mensaje);
        } else {
          return throwError('Ocurrió un error al intentar validar el código para recuperar contraseña');
        }
      })
    );
  }

  generarCodigoRestablecerContrasenia(usuario: string): Observable<HttpRespuesta<any>> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + `/contrasenia/genera-codigo`, {usuario});
    // return of<HttpRespuesta<any>>(respCodigoRestablecerContrasenia);
  }

  obtenerCatalogos(): void {
    this.httpClient.post<HttpRespuesta<any>>(environment.api.login + '/catalogos/consulta', {})
      .subscribe({
        next: (respuesta) => {
          const {datos} = respuesta;
          const {catalogos} = datos ?? {};
          this.guardarCatalogosEnLocalStorage(catalogos)
        },
        error: (error) => {
          console.log(error)
        }
      })
  }

  guardarCatalogosEnLocalStorage<T extends { [key: string]: T }>(obj: T): void {
    Object.keys(obj).forEach(propiedad => {
      localStorage.setItem(`catalogo_${propiedad}`, JSON.stringify(obj[propiedad]));
    });
  }

  obtenerCatalogoDeLocalStorage<T>(propiedad: string): any {
    const catalogo = JSON.parse(localStorage.getItem(propiedad) as string);
    return catalogo ?? [];
  }


}
