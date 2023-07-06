import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";

@Injectable()
export class RealizarPagoService extends BaseService<HttpRespuesta<any>, any> {

  private readonly _odsPagos: string = 'consultar-ods-pagos';
  private readonly _prevFunPagos: string = 'consultar-prevFun-pagos';
  private readonly _renPrevFunPagos: string = 'consultar-renPrevFun-pagos';
  private readonly _odsFolios: string = 'consultar-folios-ods-pagos';
  private readonly _prevFunFolios: string = 'consultar-folios-prevFun-pagos';
  private readonly _renPrevFunFolios: string = 'consultar-folios-renPrevFun-pagos';
  private readonly _detallePago: string = 'buscar-detalle-pago';

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "crear_pagos", "",
      36, "consultar-tabla-pagos", "", "");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
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
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._paginado}`,
      filtros, {params});
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  consultarPagosODS(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._odsPagos);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  consultarPagosConvenio(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._prevFunPagos);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  consultarPagosRenovacionConvenio(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._renPrevFunPagos);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  consultarFoliosODS(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._odsFolios);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  consultarFoliosPrevFun(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._prevFunFolios);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  consultarFoliosRenPrevFun(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._renPrevFunFolios);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  consultarDetallePago(idPagoBitacora: number): Observable<HttpRespuesta<any>> {
    const body = {idPagoBitacora}
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._detallePago}`, body)
  }

}