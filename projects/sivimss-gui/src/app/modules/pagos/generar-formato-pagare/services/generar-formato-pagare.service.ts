import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from 'projects/sivimss-gui/src/app/utils/base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable, of} from 'rxjs';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {AutenticacionService} from "../../../../services/autenticacion.service";

@Injectable()
export class GenerarFormatoPagareService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-pagare", "", 22, "consultar-pagares", "detalle-pagare", "");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/buscar-pagares`, filtros,
      {params});
  }

  buscarDatosPagare(id: number): Observable<HttpRespuesta<any>> {
    const body = {id}
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._detalle}`, body);
  }

  obtenerImporteLetra(importe: number): Observable<HttpRespuesta<any>> {
    const body = {importe}
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/importe-pagare`, body);
  }


  descargarFormato<T>(body: T): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });

    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-pagare/generarDocumento/pdf`, body,
      {headers, responseType: 'blob' as 'json'})
  }

  descargarListadoPagares<T>(body: T): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-odspagare/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }
}
