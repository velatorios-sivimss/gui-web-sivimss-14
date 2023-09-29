import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {BaseService} from "../../../utils/base-service";
import {environment} from "projects/sivimss-gui/src/environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AutenticacionService} from "../../../services/autenticacion.service";


@Injectable()
export class CapillaReservacionService extends BaseService<HttpRespuesta<any>, any> {

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "registrar-entrada", "art-modificar",
      31, "art-buscar", "art-detalle", "art-cambiar-estatus");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, {params});
  }

  buscarTodosPorFiltros(filtros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/art-buscar-general`, filtros);
  }

  registrarSalida(t: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/registrar-salida`, t);
  }

  obtenerCatalogoCapillasDisponibles(): Observable<HttpRespuesta<any>> {
    let velatorios = 'DOCTORES'
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/capillas-disponibles`, velatorios);
  }

  obtenerCatalogoVelatorios(): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "catalogo");
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, {params});
  }

  buscarCapillasPorIdVelatorio(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}` + id, {params});
  }

  consultarODS(folioODS: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", 'buscar-ods')
      .append("palabra", folioODS);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, {params});
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  buscarPorIdVelatorio(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "capillas-disponibles").append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, {params});
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }

  capillaOcupadaPorIdVelatorio(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "capillas-ocupadas").append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, {params});
  }

  consultarCapillas(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/disponibilidad`, parametros);
  }

  consultaMes(mes: string, anio: string, idVelatorio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-consulta-mes`,
      {"mes": mes, "anio": anio, "idVelatorio": idVelatorio});
  }

  consultaDetallePorDia(fecha: string, idCapilla: number): Observable<HttpRespuesta<any>> {
    const body = {fecha: fecha, idCapilla: idCapilla};
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/detalle`,
      body);
  }

  generarReporte(filtroArchivo: any): Observable<Blob> {
    const tipo = filtroArchivo.tipoReporte;
    return this._http.post<any>(this._base + `${this._funcionalidad}/generarPdf/generarDocumento/` + tipo,
      {
        idVelatorio: filtroArchivo.idVelatorio, mes: filtroArchivo.mes, anio: filtroArchivo.anio,
        rutaNombreReporte: filtroArchivo.rutaNombreReporte,
        tipoReporte: filtroArchivo.tipoReporte
      },
      {responseType: 'blob' as any});
  }

  generarFormatEntregaCapilla(filtro: any): Observable<Blob> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/entregaCapilla/generarDocumento/pdf`,
      {
        idCapilla: filtro.idCapilla, folioOds: filtro.folioOds,
        rutaNombreReporte: filtro.rutaNombreReporte,
        tipoReporte: filtro.tipoReporte
      },
      {responseType: 'blob' as any});
  }

}
