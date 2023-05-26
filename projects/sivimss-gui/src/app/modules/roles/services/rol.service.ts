import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {BaseService} from "../../../utils/base-service";
import {environment} from '../../../../environments/environment';
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class RolService extends BaseService<HttpRespuesta<any>, any> {

  private auth_token3: string = "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiMVwiLFwibm9tYnJlXCI6XCIxIDEgMVwiLFwiY3VycFwiOlwiMVwifSIsImlhdCI6MTY4MTE2NTMyNCwiZXhwIjoxNjgxNzcwMTI0fQ.krsXJqvtKlgKlxTvWt2P0cLlGhZDGb9G7vWcNKnD0MU";

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-rol", "actualiza-rol",
      4, "consulta-roles", "detalle-rol", "cambia-estatus");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const headers: HttpHeaders = new HttpHeaders({
      Authorization: `Bearer ${this.auth_token3}`,
      'Content-Type': 'application/json'
    });
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-filtro`, filtros, {
      headers,
      params
    });
  }

  obtenerCatRolesPaginadoSinFiltro(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", 'consulta-roles');
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}`, {params})
  }

  obtenerCatRoles(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", "consultar-rol");
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, {params});
  }

  obtenerCatNivel(): Observable<TipoDropdown[]> {
    const catalogo_nivelOficina = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(catalogo_nivelOficina, "desc", "id"));
  }

}
