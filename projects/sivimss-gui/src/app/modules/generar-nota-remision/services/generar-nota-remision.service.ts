import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { BaseService } from 'projects/sivimss-gui/src/app/utils/base-service';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { ConsultaNotaRemision } from '../models/nota-remision.interface';

@Injectable()
export class GenerarNotaRemisionService extends BaseService<HttpRespuesta<any>, any> {
  constructor( _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "generar-notarem", "modificar",
      54, "consultar-notasrem", "detalle-notasgen", "cambiar-estatus");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/buscar-notasrem`, filtros, { params });
  }

  buscarTodasOdsGeneradas(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo?servicio=lista-ods-gen`);
  }

  cancelarNotaRemision(obj: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/cancelar-notarem`, obj);
  }

  obtenerDetalleNotaRemision(consultaNotaRemision: ConsultaNotaRemision): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-notasgen`, consultaNotaRemision);
  }

  obtenerServiciosNotaRemision(consultaServicioRemision: ConsultaNotaRemision): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/servicios-notagen`, consultaServicioRemision);
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
    const body = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8087/mssivimss-oauth/velatorio/consulta`, body);
  }
}
