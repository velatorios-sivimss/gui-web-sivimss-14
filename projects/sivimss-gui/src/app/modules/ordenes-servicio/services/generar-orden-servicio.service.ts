import {BaseService} from '../../../utils/base-service';
import {HttpRespuesta} from '../../../models/http-respuesta.interface';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AutenticacionService} from '../../../services/autenticacion.service';
import {environment} from '../../../../environments/environment';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {TipoDropdown} from '../../../models/tipo-dropdown';
import {mapearArregloTipoDropdown} from '../../../utils/funciones';
import {MensajeSistema} from '../../../models/mensaje-sistema';
import {Panteon} from "../models/Panteon.interface";

@Injectable()
export class GenerarOrdenServicioService extends BaseService<HttpRespuesta<any>, any> {

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
    console.log(mensajeSistema);
    return mensajeSistema ? mensajeSistema.desMensaje : '';
  }

  consutaCP(cp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/codigo-postal/` + cp
    );
  }

  consultarCURP(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-curp`,
      {curp: curp}
    );
  }

  consultarRFC(rfc: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-rfc`,
      {rfc: rfc}
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

  buscarCapillas(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-consultar-capillas`,
      parametros
    );
  }

  buscarSalas(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-consultar-salas`,
      parametros
    );
  }

  generarODS(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/orden-guardar`,
      parametros
    );
  }

  buscarPromotor(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/catalogo/orden-consultar-promotores`
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

  consultarTodoslosAtaudes(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-articulos-funerarios-consultar-ataudes`,
      parametros
    );
  }

  consultarTodaslasUrnas(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-articulos-funerarios-consultar-urnas`,
      parametros
    );
  }

  consultarEmpaques(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-articulos-funerarios-consultar-empaques`,
      parametros
    );
  }

  consultarArticulosComplementarios(
    parametros: any
  ): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-articulos-complementarios-consultar`,
      parametros
    );
  }

  consultarTodoslosEmpaques(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/buscar-filtros/orden-articulos-funerarios-consultar-empaques`,
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

  consultarServiciosVigentes(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base +
      `${this._funcionalidad}/catalogo/orden-servicios-vigentes-consultar`
    );
  }

  consultarMatriculaSiap(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/siap/${matricula}`
    );
  }

  consultarDatosPanteon(nombrePanteon: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-buscar-panteon`,
      {nombrePanteon: nombrePanteon})
  }

  guardarPanteon(objetoGuardarPanteon: Panteon): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/orden-guardar-panteon`,
      objetoGuardarPanteon)
  }

  consultarContratoPf(folio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-contratoPf`,
      folio)
  }

  consultarContratantesPf(idContrato: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-contratantes-contratoPf`,
      {idContrato: idContrato})
  }

  consultarBeneficiariosPf(idContrato: number, idContratante: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-contratantes-benficiarios`,
      {idContrato: idContrato, idContratante: idContratante})
  }

  consultarPersona(idPersona: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-persona-consultar`,
      {idPersona: idPersona})
  }

  generarArchivoServiciosInmediatos(idOrdenServicio: number, tipoOrden: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-contrato-serv-inmediato-generada`,
      {idOrdenServicio: idOrdenServicio, generaReporte: tipoOrden, tipoReporte: 'pdf'});
  }

  generarArchivoOrdenServicio(idOrdenServicio: number, estatus: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/reporte-orden-servicio-generada`,
      {idOrdenServicio: idOrdenServicio, estatus: estatus, tipoReporte: 'pdf'});
  }

  consultarKilometrajePaquete(idPaquete: number, idProveedor: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-paquete-kilometraje`,
      {idPaquete: idPaquete, idProveedor});
  }

  consultarKilometrajeServicio(idServicio: number, idProveedor: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-servicio-kilometraje`,
      {idServicio: idServicio, idProveedor: idProveedor});
  }


  generarODSSF(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/orden-guardar-sf`, parametros);
  }

  detalleODSSF(idOrdenServicio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/orden-detalle-sf`,
      {idOrdenServicio: idOrdenServicio});
  }

  actualizarODSSF(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/orden-actualizar-sf`,
      parametros);
  }

  consultarFolioSF(folio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/orden-consultar-convenio-pa-sf`,
      {folio: folio});
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
