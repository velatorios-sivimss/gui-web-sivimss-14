import { BaseService } from '../../../utils/base-service';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { MensajeSistema } from '../../../models/mensaje-sistema';

@Injectable()
export class GenerarOrdenServicioService extends BaseService<
  HttpRespuesta<any>,
  any
> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 20, '', '', '');
  }

  private mensajesSistemaSubject: BehaviorSubject<MensajeSistema[] | null> =
    new BehaviorSubject<MensajeSistema[] | null>(null);

  obtenerCatalogoParentesco(): Observable<TipoDropdown[]> {
    const catalogo_parentesco = this.authService.obtenerCatalogoDeLocalStorage(
      'catalogo_parentesco'
    );
    return of(mapearArregloTipoDropdown(catalogo_parentesco, 'desc', 'id'));
  }

  obtenerCatalogoPais(): Observable<TipoDropdown[]> {
    const catalogo_pais =
      this.authService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    return of(mapearArregloTipoDropdown(catalogo_pais, 'desc', 'id'));
  }

  obtenerCatalogoEstado(): Observable<TipoDropdown[]> {
    const catalogo_estados =
      this.authService.obtenerCatalogoDeLocalStorage('catalogo_estados');
    return of(mapearArregloTipoDropdown(catalogo_estados, 'desc', 'id'));
  }

  obtenerCatalogosUnidadesMedicas(): Observable<TipoDropdown[]> {
    const catalogo_unidadesMedicas =
      this.authService.obtenerCatalogoDeLocalStorage(
        'catalogo_unidadesMedicas'
      );
    return of(
      mapearArregloTipoDropdown(catalogo_unidadesMedicas, 'desc', 'id')
    );
  }

  obtenerCatalogosPenciones(): Observable<TipoDropdown[]> {
    const catalogo_unidadesMedicas =
      this.authService.obtenerCatalogoDeLocalStorage('catalogo_tipoPension');
    return of(
      mapearArregloTipoDropdown(catalogo_unidadesMedicas, 'desc', 'id')
    );
  }

  obtenerMensajeSistemaPorId(id: number): string {
    const mensajeSistema = this.mensajesSistemaSubject
      .getValue()
      ?.find(
        (mensajeSistema: MensajeSistema) => mensajeSistema.idMensaje === id
      );
    return mensajeSistema ? mensajeSistema.desMensaje : '';
  }

  consutaCP(cp: String): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/codigo-postal/` + cp
    );
  }

  consultarCURP(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-curp`,
      { curp: curp }
    );
  }

  consultarRFC(rfc: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-rfc`,
      { rfc: rfc }
    );
  }

  consultarNSS(nss: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/nss/` + nss
    );
  }

  consultarPaquetes(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
        `${this._funcionalidad}/buscar-filtros/orden-paquete-consultar`,
      parametros
    );
  }

  consultarDetallePaquete(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
        `${this._funcionalidad}/buscar-filtros/orden-paquete-consultar-caracteristicas`,
      parametros
    );
  }

  consultarTipoAsignacion(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
        `${this._funcionalidad}/buscar-filtros/orden-paquete-ataud-asignacion`,
      parametros
    );
  }

  consultarAtaudes(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/buscar-filtros/orden-paquete-ataud`,
      parametros
    );
  }

  consultarProveedorAtaudes(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
        `${this._funcionalidad}/buscar-filtros/orden-paquete-ataud-proveedor`,
      parametros
    );
  }

  consultarAtaudInventario(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
        `${this._funcionalidad}/buscar-filtros/orden-paquete-ataud-inventario`,
      parametros
    );
  }

  consultarProveeedorServicio(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
        `${this._funcionalidad}/buscar-filtros/orden-servicios-proveedor-consultar`,
      parametros
    );
  }
}
