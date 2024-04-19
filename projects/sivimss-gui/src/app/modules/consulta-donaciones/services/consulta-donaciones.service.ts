import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "projects/sivimss-gui/src/environments/environment";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class ConsultaDonacionesService extends BaseService<HttpRespuesta<any>, any> {


  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "consultar-donados", "consu-filtrodonados",
      64, "consultar-donados", "consultar-velatorio", "consultar-nivel");
  }

  buscarAtaudesPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("pagina", pagina).append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consu-filtrodonados`, filtros, {params});
  }

  exportarArchivo(tipoArchivo: any,): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "generarDocumento")
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/generarDocumento`, tipoArchivo, {params});
  }

  generarReporte(filtro: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/generarDocumento`, filtro)
  }

  generarReporteEntrada(filtro: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/generarDocumentoEntrada`, filtro)
  }

  generarReporteSalida(filtro: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/generarDocumentoSalida`, filtro)
  }

  obtenerCatalogoataudes(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "consultar-donados").append("pagina", pagina).append("tamanio", tamanio)
    return this._http.get<HttpRespuesta<any>>(this._base + `1`, {params})
  }


  actualizarAtaudes(capilla: any): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._actualizar}`, capilla);
  }


  obtenerCatalogoVelatorios(): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "consultar-velatorio")
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, {params});
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const catalogo_nivelOficina = this.authService.obtenerCatalogoDeCookies(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(catalogo_nivelOficina, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }


}
