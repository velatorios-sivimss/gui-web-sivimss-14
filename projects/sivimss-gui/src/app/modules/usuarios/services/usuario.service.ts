import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {BaseService} from "../../../utils/base-service";
import {environment} from '../../../../environments/environment';
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class UsuarioService extends BaseService<HttpRespuesta<any>, any> {

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-usuario", "actualizar-usuario",
      2, "consultar-usuarios", "detalle-usuario", "cambiar-estatus-usr");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/buscar-usuarios`, filtros,
      {params});
  }

  validarCurp(curp: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/valida-curp`, curp);
  }

  consultarCurpRenapo(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8083/mssivimss-servicios-externos/v1/catalogos/externos/consultar/curp/${curp}`);
  }

  validarMatricula(matricula: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/valida-matricula`, matricula);
  }

  consultarMatriculaSiap(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8083/mssivimss-servicios-externos/v1/catalogos/externos/consultar/siap/${matricula}`);
  }

  obtenerCatalogoRoles(): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", "catalogo-roles")
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo`, {params});
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = {idDelegacion: delegacion}
    return of({error: false, codigo: 2, mensaje: "", datos: []})
    // return this._http.post<HttpRespuesta<any>>(`http://localhost:8079/mssivimss-oauth/velatorio/consulta`, body);
  }

  descargarListado(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body = {idNota: 1, idOrden: 1, tipoReporte: "pdf"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-usuarios/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }

  descargarListadoExcel(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body = {idNota: 1, idOrden: 1, tipoReporte: "xls"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-usuarios/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }
}
