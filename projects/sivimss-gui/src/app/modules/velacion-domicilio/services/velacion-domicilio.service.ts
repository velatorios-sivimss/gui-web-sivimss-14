import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BaseService } from "../../../utils/base-service";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { environment } from "projects/sivimss-gui/src/environments/environment";
import { Observable, of } from "rxjs";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";
import { BuscarFoliosOds, ControlMovimiento, ReporteTabla } from "../models/velacion-domicilio.interface";

@Injectable()
export class VelacionDomicilioService extends BaseService<HttpRespuesta<any>, any> {
  auth_token2: any;
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "crear", "modificar",
      58, "consultar", "detalle", "cambiar-estatus");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vales-salida-filtros`, filtros, { params });
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vales-salida`, {}, { params });
  }

  obtenerOds(datos: BuscarFoliosOds): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vs-folios-osd`, datos);
  }

  obtenerDetalleValeSalida(idValeSalida: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${idValeSalida}?servicio=consultar-vale-salida-detalle`);
  }

  obtenerDatosFolioOds(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vs-datos-ods`, datos);
  }

  crearValeSalida(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/crear-vale-salida`, datos);
  }

  actualizarValeSalida(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/actualizar-vale-salida`, datos);
  }

  eliminarVale(idValeSalida: number): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/cambiar-estatus-vale-salida`, { idValeSalida });
  }

  registrarSalida(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/registrar-entrada-vale-salida`, datos);
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
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  descargarValeSalida(controlMovimiento: ControlMovimiento): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-vale-salida/generarDocumento/pdf`
      , controlMovimiento, { headers, responseType: 'blob' as 'json' });
  }

  descargarRegistrosTabla(reporteTabla: ReporteTabla): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-tabla-vale-salida/generarDocumento/${reporteTabla.tipoReporte}`
      , reporteTabla, { headers, responseType: 'blob' as 'json' });
  }
}
