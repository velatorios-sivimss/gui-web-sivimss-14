import { Injectable } from '@angular/core';
import { BaseService } from '../../../utils/base-service';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { BuscarCatalogo, BuscarGenerarHojaConsignacion } from '../models/generar-hoja-consignacion.interface';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { AutenticacionService } from '../../../services/autenticacion.service';

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class GenerarHojaConsignacionService extends BaseService<HttpRespuesta<any>, any> {
  private readonly _nivel: string = 'catalogo_nivelOficina';
  private readonly _delegacion: string = 'catalogo_delegaciones';

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "generar-hoja", "actualizar",
      39, "hoja-consig", "detalle-hoja-consig", "_estatus");
  }

  buscarArticulos(buscarArticulos: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/articulos-consig`, buscarArticulos);
  }

  generarHoja(generarHoja: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._agregar}`, generarHoja);
  }

  reporteHojaConsignacion(reporteHojaConsignacion: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-hoja-consig/generarDocumento/pdf`
      , reporteHojaConsignacion, { responseType: 'blob' as 'json' });
  }

  obtenerCatalogos(buscarCatalogo: BuscarCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/catalogos`, buscarCatalogo);
  }

  buscarPorFiltros(filtros: BuscarGenerarHojaConsignacion, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  generarReporteConsulta(reporte: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-consulta/generarDocumento/pdf`
      , reporte, { headers, responseType: 'blob' as 'json' });
  }

  obtenerDetalleHojaConsignacion(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  adjuntarFactura(factura: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/adjuntar-factura`, factura);
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  velatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: ConsultaVelatorio = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }
}
