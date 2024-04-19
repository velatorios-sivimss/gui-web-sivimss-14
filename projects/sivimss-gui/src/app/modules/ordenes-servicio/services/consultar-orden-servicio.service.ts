import {Injectable} from "@angular/core";
import {BaseService} from "../../../utils/base-service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {OrdenServicioFiltroConsulta} from "../models/orden-servicio-paginado.interface";

@Injectable()
export class ConsultarOrdenServicioService extends BaseService<HttpRespuesta<any>, any> {

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "", "",
      24, "", "", "");
  }

  consultarVelatorios(idDelegacion: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-velatorio`,
      {idDelegacion: idDelegacion});
  }

  consultarFolioODS(idVelatorio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-folio-ods`,
      {idVelatorio: idVelatorio});
  }


  consultaTipoODS(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", 0)
      .append("tamanio", 5)
      .append("servicio", 'consultar-tipo-ods')
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}`, {params});
  }

  obtenerCatalogoEstatus(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", 0)
      .append("tamanio", 5)
      .append("servicio", 'consultar-estado-ods')
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}`, {params});
  }

  // unidadMedica(idDelegacion: number): Observable<HttpRespuesta<any>> {
  //   return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-unidad-medica`,
  //     {idDelegacion: idDelegacion});
  // }

  unidadMedica(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies(('catalogo_unidadesMedicas'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  nombreContratante(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-nombre-contratantes`, {});
  }

  nombreFinado(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-nombre-finados`, {});
  }

  consultarODS(objetoPaginado: OrdenServicioFiltroConsulta, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("pagina", pagina).append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-ods`,
      objetoPaginado, {params});
  }

  cancelarODS(objetoCancelar: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/cancelar-ods`,
      objetoCancelar);
  }

  consultarOperadores(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", 0)
      .append("tamanio", 5)
      .append("servicio", 'consultar-operadores');
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}`, {params});
  }

  consultarPrecioCancelacionODS(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-costo-cancelar`, {})
  }


  crearTarjetaIdentificacion(idOperador: number, idOrdenServicio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/tarjeta-identificacion`,
      {idOperador: idOperador, idOrdenServicio: idOrdenServicio});
  }

  generarArchivoTarjetaIdetificacion(idOperador: string, idOrdenServicio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-tarjeta-iden`,
      {idOperador: idOperador, idOrdenServicio: idOrdenServicio});
  }

  generarArchivoPaginador(objetoPaginado: OrdenServicioFiltroConsulta): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-ods-consulta`, objetoPaginado);
  }

  generarArchivoServiciosInmediatos(idOrdenServicio: number, tipoOrden: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-contrato-serv-inmediato`,
      {idOrdenServicio: idOrdenServicio, generaReporte: tipoOrden, tipoReporte: 'pdf'});
  }

  generarArchivoOrdenServicio(idOrdenServicio: number, estatus: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-orden-servicio`,
      {idOrdenServicio: idOrdenServicio, estatus: estatus, tipoReporte: 'pdf'});
  }

  generarArchivoEntradaDonaciones(idOrdenServicio: number, generaReporte: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-donacion`,
      {idOrdenServicio: idOrdenServicio, generaReporte: generaReporte, tipoReporte: 'pdf'});
  }

  generarArchivoSalidaDonaciones(idOrdenServicio: number, generaReporte: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-salida-donacion`,
      {idOrdenServicio: idOrdenServicio, generaReporte: generaReporte, tipoReporte: 'pdf'});
  }


}
