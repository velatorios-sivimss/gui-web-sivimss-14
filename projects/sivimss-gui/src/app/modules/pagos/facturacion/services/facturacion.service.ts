import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable()
export class FacturacionService extends BaseService<HttpRespuesta<any>, any> {

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "", "", 100, "consultar-tabla-facturacion", "", "");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros,
      {params});
  }

  obtenerCatalogoVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, {}, {params});
  }

  obtenerFolioODS(tipoFactura: string): Observable<HttpRespuesta<any>> {
    const body = {tipoFactura};
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-folios-facturacion`, body);
  }

}
