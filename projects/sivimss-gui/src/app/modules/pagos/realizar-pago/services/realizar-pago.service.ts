import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable()
export class RealizarPagoService extends BaseService<HttpRespuesta<any>, any> {

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `http://localhost:8080/mssivimss-ctrol-permisos/v1/sivimss/service/`, "", "",
      36, "consultar-tabla-pagos", "", "");
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._paginado}`, {}, {params})
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`,
      filtros, {params});
  }
}
