import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { BaseService } from '../../../utils/base-service';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';

@Injectable()
export class GenerarOrdenSubrogacionService extends BaseService<HttpRespuesta<any>, any> {

  ordenSeleccionada: any;

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-order", "actualizar-orden",
      37, "orden", "detalle-orden", "cambiar-estatus");
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: any = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
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

  consultarFolios(folio: string, idVelatorio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consultar-folio-orden`,
      { idVelatorio: idVelatorio, folioOrdenServicio: folio });
  }

  consultarProveedor(idVelatorio: string, proveedor: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consultar-proveedor`,
      { idVelatorio: idVelatorio, nombreProveedor: proveedor });
  }

  consultarServicios(idOrdenServicio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/hoja-subrogacion-servicios`,
      { idOrdenServicio: idOrdenServicio });
  }

  buscarPorFiltros(pagina: number, tamanio: number, t: any): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/hoja-subrogacion-filtros`, t,
      { params });
  }

  guardarOrden(orden: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/inserta-hoja-subrogacion`, orden);
  }

  actualizarOrden(orden: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/modifica-hoja-subrogacion`, orden);
  }

  // generarReporte(datosReporte: any): Observable<Blob> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Accept: 'application/json'
  //   });
  //   return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/reporte-hoja-subrogacion`
  //     , datosReporte, { headers, responseType: 'blob' as 'json' });
  // }

  generarReporte(datosReporte:any) : Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/reporte-hoja-subrogacion`, datosReporte)
  }

  generarHojaSubrogacion(datosReporte: any): Observable<HttpRespuesta<any>> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/hoja-subrogacion-generar-pdf/generarDocumento/pdf`
      , datosReporte, { responseType: 'blob' as 'json' });
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }

  detalleSubrogacion(idHojaSubrogacion: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-subrogacion`,
      {idHojaSubrogacion: idHojaSubrogacion});
  }

}
