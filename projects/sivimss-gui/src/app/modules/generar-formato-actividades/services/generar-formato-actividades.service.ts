import { Injectable } from '@angular/core';
import { BaseService } from '../../../utils/base-service';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { BuscarCatalogo, BuscarGenerarFormatoActividades, GenerarFormatoActividades } from '../models/generar-formato-actividades.interface';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { AutenticacionService } from '../../../services/autenticacion.service';

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class GenerarFormatoActividadesService extends BaseService<HttpRespuesta<any>, any> {
  private readonly _nivel: string = 'catalogo_nivelOficina';
  private readonly _delegacion: string = 'catalogo_delegaciones';

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "registrar-actividad", "registrar-actividad",
      75, "buscar-formato", "detalle-actividades", "cambiar-estatus");
  }

  buscarPorFiltros(filtros: BuscarGenerarFormatoActividades, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  obtenerDetalleFormato(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", 'detalle-formato')
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  obtenerActividades(id: number, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._detalle)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  agregarActividad(generarFormatoActividades: GenerarFormatoActividades): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._agregar}`, generarFormatoActividades);
  }

  eliminarActividad(idActividad: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/eliminar-actividad`, { idActividad });
  }

  obtenerCatalogo(buscarCatalogo: BuscarCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/catalogo`, buscarCatalogo);
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

  obtenerVelatorios(buscarCatalogo: BuscarCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `15/buscar/nombre-promotor`, buscarCatalogo);
  }

  obtenerCatalogos(buscarCatalogo: BuscarCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/catalogo`, buscarCatalogo);
  }

  generarReporteActividades(reporte: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/formato-actividades/generarDocumento/pdf`
      , reporte, { headers, responseType: 'blob' as 'json' });
  }

  previsualizarReporte(reporte: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/formato-actividades/generarDocumento/pdf`, reporte, { responseType: 'blob' as any });
  }

  generarReporteConsulta(reporte: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-actividades/generarDocumento/pdf`
      , reporte, { headers, responseType: 'blob' as 'json' });
  }
}
