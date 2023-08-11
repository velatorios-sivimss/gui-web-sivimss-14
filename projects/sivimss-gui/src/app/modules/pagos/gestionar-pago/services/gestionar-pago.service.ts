import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable()
export class GestionarPagoService extends BaseService<HttpRespuesta<any>, any> {

  private readonly _odsFolios: string = 'genpago-ods';
  private readonly _prevFunFolios: string = 'genpago-pf';
  private readonly _renPrevFunFolios: string = 'genpago-rpf';
  private readonly _modificarPago: string = 'genpago-modifica';
  private readonly _eliminarPago: string = 'genpago-cancela';
  private readonly _imprimirPago: string = 'genpago-docto';

  body = {velatorio: null}

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 66,
      'genpago-consulta', 'genpago-detalle', '');
  }

  consultarFoliosODS(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._odsFolios}`, this.body);
  }

  consultarFoliosPrevFun(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._prevFunFolios}`, this.body);
  }

  consultarFoliosRenPrevFun(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._renPrevFunFolios}`, this.body);
  }

  obtenerDetallePago(idPago: number, idFlujo: number): Observable<HttpRespuesta<any>> {
    const body = {idPago, idFlujo};
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._detalle}`, body);
  }

  cancelarMetodoPago(body: any): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._eliminarPago}`, body)
  }

  modificarMetodoPago(body: any): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._modificarPago}`, body)
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

  descargarListado(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body = {tipoReporte: "pdf"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/${this._imprimirPago}/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }

  descargarListadoExcel(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body = {tipoReporte: "xls"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/${this._imprimirPago}/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }
}
