import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from 'projects/sivimss-gui/src/app/utils/base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable, of} from 'rxjs';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {AutenticacionService} from "../../../../services/autenticacion.service";

interface PeticionDescarga {
  tipoReporte: "pdf" | "xls"
}

@Injectable()
export class GenerarReciboService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "", "", 23, "consultar-rec-pagos", "", "");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/rec-pagos-filtros`, filtros,
      {params});
  }

  buscarDatosReportePagos(idPagoBitacora: number): Observable<HttpRespuesta<any>> {
    const body = {idPagoBitacora}
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/datos-rec-pagos`, body);
  }

  descargarReporte<T>(body: T): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });

    return this._http.post<any>(this._base + `${this._funcionalidad}/plantilla-rec-pagos/generarDocumento/pdf`, body,
      {headers, responseType: 'blob' as 'json'})
  }

  descargarListadoPDF(body: any): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/generar-rec-pagos/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }

  descargarListadoExcel(): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body: PeticionDescarga = {tipoReporte: "xls"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/generar-rec-pagos/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }
}
