import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from 'projects/sivimss-gui/src/app/utils/base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable, of} from 'rxjs';
import {TipoDropdown} from '../../../models/tipo-dropdown';
import {mapearArregloTipoDropdown} from '../../../utils/funciones';
import {AutenticacionService} from '../../../services/autenticacion.service';

@Injectable()
export class BalanceCajaService extends BaseService<HttpRespuesta<any>, any> {

  balanceSeleccionado: any;
  filtrosBalanceSeleccionados: any;

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-rec-pagos", "", 69, "consultar-rec-pagos", "", "");
  }

  private readonly _folios: string = 'consultar-folios-rec-pagos';
  private readonly _filtros: string = 'consultar-balance-caja';

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._filtros}`, filtros,
      {params});
  }

  buscarDatosReportePagos(idPagoBitacora: number): Observable<HttpRespuesta<any>> {
    const body: { idPagoBitacora: number } = {idPagoBitacora}
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/datos-rec-pagos`, body);
  }

  modificarPago(datos: any) {
    return this._http.put<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/balance-caja-modificar-pago`, datos);
  }

  realizarCierre(datos: any) {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/actualiza-estatus-cierre`, datos);
  }

  generarReporte(filtro: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/reporte-balance-caja`, filtro)
  }

  obtenerFoliosODS(idVelatorio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._folios}`, {idVelatorio});
  }

  obtenerDetalleComision(idValeSalida: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `58/${idValeSalida}?servicio=consultar-vale-salida-detalle`);
  }

}
