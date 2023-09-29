import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable()
export class FacturacionService extends BaseService<HttpRespuesta<any>, any> {

  private readonly _filtros: string = 'consultar-folios-facturacion';
  private readonly _infoFiltros: string = 'consultar-info-folios-facturacion';
  private readonly _rfc: string = 'consultar-rfc-facturacion';
  private readonly _cfdi: string = 'consultar-cfdi-facturacion';
  private readonly _metodosPago: string = 'consultar-metodo-pago-facturacion';
  private readonly _formasPago: string = 'consultar-forma-pago-facturacion';
  private readonly _crearFactura: string = 'crear_factura';

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "", "", 100, "consultar-tabla-facturacion", "", "");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros,
      {params});
  }

  obtenerCatalogoVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, {}, {params});
  }

  obtenerFolioODS(tipoFactura: string): Observable<HttpRespuesta<any>> {
    const body: { tipoFactura: string } = {tipoFactura};
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._filtros}`, body);
  }

  obtenerInfoFolioFacturacion(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._infoFiltros}`, body);
  }

  consultarRFC(rfc: string): Observable<HttpRespuesta<any>> {
    const body = { rfc };
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._rfc}`, body);
  }

  consultarCFDI(tipoPersona: string): Observable<HttpRespuesta<any>> {
    const body = { tipoPersona };
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._cfdi}`, body);
  }

  consultarMetodosPago(tipoPersona: string): Observable<HttpRespuesta<any>> {
    const body = { tipoPersona };
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._metodosPago}`, body);
  }

  consultarFormasPago(tipoPersona: string): Observable<HttpRespuesta<any>> {
    const body = { tipoPersona };
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._formasPago}`, body);
  }

  generarSolicitudPago(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._crearFactura}`, body);
  }
}
