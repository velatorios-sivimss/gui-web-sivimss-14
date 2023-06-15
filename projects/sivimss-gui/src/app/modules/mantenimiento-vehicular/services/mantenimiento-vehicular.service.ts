import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {CATALOGO_TIPO_REPORTE_ENCARGADO} from "../constants/catalogos-filtros";

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class MantenimientoVehicularService extends BaseService<HttpRespuesta<any>, any> {

  private readonly _nivel: string = 'catalogo_nivelOficina';
  private readonly _delegacion: string = 'catalogo_delegaciones';
  private readonly _proveedores: string = 'cat-mtto-proveedores';
  private readonly _vehiculos: string = 'busqueda-vehiculos-mtto';
  private readonly _reporte_mtto: string = 'cat-mtto-reporte-tipo-mtto';
  private readonly _detalle_verificacion: string = 'detalle-verificacion-inicio';
  private readonly _detalle_solicitud: string = 'detalle-solicitud-mtto';
  private readonly _detalle_registro: string = 'detalle-registro-mtto';
  private readonly _reporte_predictivo: string = 'reporte-predictivo-vehiculos-mtto';
  private readonly _reporte_encargado: string = 'reporte-encargado-vehiculos-mtto';

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "mtto-vehicular-agregar", "mtto-vehicular-modificar",
      40, "busqueda-vehiculos-mtto", "", "");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: ConsultaVelatorio = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  obtenerCatalogoProvedores(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._proveedores);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  obtenerCatalogoPlacas(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._vehiculos);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  obtenerCatalogoReporteEncargado(): Observable<TipoDropdown[]> {
    return of(CATALOGO_TIPO_REPORTE_ENCARGADO);
  }

  obtenerCatalogoMttoPredictivo(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._reporte_mtto)
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params})
  }

  obtenerCatalogoPeriodo(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", 'cat-mtto-periodo')
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params})
  }

  buscarPorFiltros(pagina: number, tamanio: number, t: any): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._paginado}`, t,
      {params});
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._paginado);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/`, {params});
  }

  obtenerDetalleVerificacion(id: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._detalle_verificacion)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, {params});
  }

  obtenerDetalleSolicitud(id: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._detalle_solicitud)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, {params});
  }

  obtenerDetalleRegistro(id: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("servicio", this._detalle_registro)
      .append("palabra", id)
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, {params})
  }

  override actualizar(t: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._actualizar}`, t);
  }

  obtenerRegistroVehiculo(idVehiculo: number): Observable<HttpRespuesta<any>> {
    const body = {idVehiculo}
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._paginado}`, body)
  }

  buscarReporteMttoPreventivo(t: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._reporte_predictivo}`, t);
  }

  buscarReporteEncargado(t: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._reporte_encargado}`, t);
  }
}
