import { Injectable } from "@angular/core";
import { BaseService } from "../../../utils/base-service";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { environment } from "../../../../environments/environment";
import { Observable, of } from "rxjs";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";

@Injectable()
export class OrdenEntradaService extends BaseService<HttpRespuesta<any>, any>{

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "", "", 13, "", "", "");
  }

  readonly _delegacion: string = 'catalogo_delegaciones';
  readonly _nivel: string = 'catalogo_nivelOficina';

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeCookies((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: any = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }

  consultarFolioODE(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/consulta-contrato-velatorio`);
  }

  consultarOrdenesEntrada(folioOrdenEntrada: string, idVelatorio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-orden-entrada-velatorio`,
      { numFolioOrdenEntrada: folioOrdenEntrada, idVelatorio: idVelatorio });
  }

  consultarRelacionOrdenEntrada(idOde: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-relacion-orden-entrada-servicio`,
    {idOrdenEntrada: idOde} );
  }

  consultarProveedor(proveedor: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-proveedor`,
      { nomProveedor: proveedor });
  }

  consultarCategoria(categoria: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-descripcion-categoria`,
      { desCategoria: categoria });
  }

  consultarContrato(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/consulta-contrato-velatorio`);
  }

  consultarContratoProveedor(idContrato: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-contrato-proveedor`,
    {idContrato: idContrato} );
  }

  consultarContratoCategoria(idContrato: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-contrato-categoria`,
    {idContrato: idContrato} );
  }

  consultarContratoModelo(idContrato: number, idCategoria: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-contrato-modelo`,
    {idContrato: idContrato, idCategoriaArticulo: idCategoria} );
  }

  consultarContratoCosto(idContrato: number, idCategoria: number, idModelo: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-contrato-costo`,
    {idContrato: idContrato, idCategoriaArticulo: idCategoria, idArticulo: idModelo} );
  }

  consultarDetalleOrdenEntrada(idOde: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-detalle-orden-entrada`,
    {idOrdenEntrada: idOde} );
  }

  consultarFolioArticulo(folio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-folio-articulo`,
    {numFolioArticulo: folio} );
  }

  actualizarOrdenEntrada(idOde: number, estatus: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/actualizar-orden-entrada`,
    {idOrdenEntrada: idOde, indEstatus: estatus} );
  }

  actualizarInventarioArticulo(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/actualizar-inventario-articulo`, datos );
  }

  guardarOrdenEntrada(datosOrdenEntrada: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/agregar-orden-entrada`, datosOrdenEntrada );
  }

  generarReporteOrdenEntrada(datosReporte: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-consulta-orden-entrada/generarDocumento/pdf`
      , datosReporte, { headers, responseType: 'blob' as 'json' });
  }

  generarReporteStock(datosReporte: any): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-consulta-stock/generarDocumento/pdf`
      , datosReporte, { headers, responseType: 'blob' as 'json' });
  }

  buscarPorFiltros(pagina: number, tamanio: number, t: any): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/consulta-orden-entrada${this._paginado}`, t,
      { params });
  }

  buscarStockPorFiltros(pagina: number, tamanio: number, t: any): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/consulta-articulo-stock${this._paginado}`, t,
      { params });
  }

}
