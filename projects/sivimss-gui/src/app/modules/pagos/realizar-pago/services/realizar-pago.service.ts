import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
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
  private readonly _eliminarPago: string = 'eliminar-pagos';
  private readonly _modificarPago: string = 'actualizar-pagos';
  private readonly _imprimirPago: string = 'generar-pdf-tabla-pagos';
  private readonly _funcionalidadAGF: number = 96;
  private readonly _validaAGF: string = 'valida-uso-agf';
  private readonly _validaVale: string = 'consultar-vale-paritaria';

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "crear_pagos", "",
      36, "consultar-tabla-pagos", "buscar-detalle-pago", "");
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

  consultarPagosODS(body: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._odsPagos}`, body, {params});
  }

  consultarPagosConvenio(body: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._prevFunPagos}`, body, {params});
  }

  consultarPagosRenovacionConvenio(body: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._renPrevFunPagos}`, body, {params});
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
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._detalle}`, body)
  }

  cancelarMetodoPago(idPagoDetalle: number): Observable<HttpRespuesta<any>> {
    const body = {idPagoDetalle};
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._eliminarPago}`, body)
  }

  modificarMetodoPago(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._modificarPago}`, body)
  }

  consultarIdODSAGF(idODS: number): Observable<HttpRespuesta<any>> {
    const body = {idODS}
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._validaAGF}`, body)
  }

  consultarIdODSVale(idOds: number): Observable<HttpRespuesta<any>> {
    const body = {idOds}
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._validaVale}`, body)
  }

  descargarListado(body: any): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/${this._imprimirPago}/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }

  obtenerRamos(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidadAGF}/0?servicio=lstramos-regis-agf`);
  }

  obtenerDetalleAGF(idFinado: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidadAGF}/${idFinado}?servicio=detalle-regis-agf`);
  }

  obtenerIdentificaciones(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidadAGF}/0?servicio=lstads-regis-agf`);
  }

  consultarBeneficiarios(nss: number, fechaDefuncion: string) {
    const body = {cveNSS: nss, fechaDefuncion}
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidadAGF}/beneficiarios-regis-agf`, body);
  }

  guardarAGF(body: any) {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidadAGF}/guarda-regis-agf`, body);
  }
}
