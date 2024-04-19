import {HttpClient, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {BaseService} from "../../../utils/base-service";
import {environment} from '../../../../environments/environment';
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {AutenticacionService} from "../../../services/autenticacion.service";

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class UsuarioService extends BaseService<HttpRespuesta<any>, any> {

  readonly _roles: string = 'catalogo-roles';
  readonly _nivel: string = 'catalogo_nivelOficina';
  readonly _delegacion: string = 'catalogo_delegaciones';
  readonly _estados: string = 'catalogo_estados';
  readonly _filtros: string = 'buscar-usuarios';

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-usuario", "actualizar-usuario",
      2, "consultar-usuarios", "detalle-usuario", "cambiar-estatus-usr");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._filtros}`,
      filtros, {params});
  }

  validarCurp(curp: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/valida-curp`, curp);
  }

  consultarCurpRenapo(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/curp/${curp}`);
  }

  validarMatricula(matricula: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/valida-matricula`, matricula);
  }

  consultarMatriculaSiap(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/siap/${matricula}`);
  }

  obtenerCatalogoRoles(idNivel: string): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._roles);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${idNivel}`, {params});
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeCookies((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerCatalogoEstados(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies((this._estados));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string): Observable<HttpRespuesta<any>> {
    const body: ConsultaVelatorio = {idDelegacion: delegacion};
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }
}
